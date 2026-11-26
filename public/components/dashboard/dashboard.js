document.addEventListener('componentsLoaded', function () {
    const conteudo = document.getElementById('dashboard-conteudo');
    if (!conteudo) return;
    const carregamento = document.getElementById('dashboard-loading');
    const componentes = document.querySelectorAll('[data-dashboard-component]');
    if (Array.from(componentes).some(function (componente) { return !componente.children.length; })) {
        carregamento.textContent = 'Não foi possível carregar o dashboard. Recarregue a página para tentar novamente.';
        return;
    }
    conteudo.hidden = false;
    carregamento.hidden = true;

    // Dados reais, vindos da sessão/servidor (window.GREENDUINO, definido em
    // src/views/dashboard/index.ejs) e da API:
    // GET /api/especies, GET /api/estufas/usuario/:id,
    // GET /dashboard/:id/atual, GET /dashboard/:id/dados,
    // POST|PUT|DELETE /api/estufas.
    const GREENDUINO = window.GREENDUINO || { idUsuario: null, idEstufaInicial: null, dadosAtuaisIniciais: null };

    let especies = [];
    let plantas = [];

    // Faixas de referência usadas enquanto a espécie não tiver uma faixa
    // própria cadastrada (campos ainda null em "especies"). Não são limites
    // agronômicos, só um ponto de partida visual.
    const PADRAO_UMIDADE_SOLO = { minimo: 40, maximo: 75 };
    const PADRAO_TEMPERATURA_AR = { minimo: 18, maximo: 30 };
    const PADRAO_UMIDADE_AR = { minimo: 50, maximo: 80 };

    function numeroOuPadrao(valor, padrao) {
        const numero = Number(valor);
        return Number.isFinite(numero) ? numero : padrao;
    }

    function obterParametros(especie) {
        const e = especie || {};
        return {
            umidade_solo: {
                nome: 'Umidade do solo', unidade: '%', icone: 'drop', escala: 100,
                minimo: numeroOuPadrao(e.umidade_solo_minima, PADRAO_UMIDADE_SOLO.minimo),
                maximo: numeroOuPadrao(e.umidade_solo_maxima, PADRAO_UMIDADE_SOLO.maximo),
                descricao: 'A umidade presente na terra'
            },
            temperatura_ar: {
                nome: 'Temperatura do ar', unidade: '°C', icone: 'temp', escala: 40,
                minimo: numeroOuPadrao(e.temperatura_minima, PADRAO_TEMPERATURA_AR.minimo),
                maximo: numeroOuPadrao(e.temperatura_maxima, PADRAO_TEMPERATURA_AR.maximo),
                descricao: 'A temperatura perto da planta'
            },
            umidade_ar: {
                nome: 'Umidade do ar', unidade: '%', icone: 'air', escala: 100,
                minimo: numeroOuPadrao(e.umidade_ar_minima, PADRAO_UMIDADE_AR.minimo),
                maximo: numeroOuPadrao(e.umidade_ar_maxima, PADRAO_UMIDADE_AR.maximo),
                descricao: 'A umidade presente no ambiente'
            }
        };
    }

    let idEstufa = GREENDUINO.idEstufaInicial;
    let idExcluir = null;
    let parametro = 'umidade_solo';
    let pagina = 'inicio';
    let temporizadorMensagem;
    let botaoOrigem;
    const formulario = document.getElementById('form-planta');
    const modalPlanta = document.getElementById('modal-planta');
    const modalExcluir = document.getElementById('modal-excluir');
    const campoNome = document.getElementById('nome_estufa');
    const campoDispositivo = document.getElementById('token_estufa');
    const campoEspecie = document.getElementById('id_especie');
    const campoModoCultivo = document.getElementById('modo_cultivo');
    const campoTamanhoVaso = document.getElementById('tamanho_vaso');
    const campoAreaHorta = document.getElementById('area_m2');
    const blocoTamanhoVaso = document.getElementById('bloco-tamanho-vaso');
    const blocoAreaHorta = document.getElementById('bloco-area-horta');
    const campoVazaoBomba = document.getElementById('vazao_bomba_ml_s');
    const botaoSalvar = document.getElementById('salvar-planta');

    function escaparTexto(valor) {
        return String(valor).replace(/[&<>"']/g, function (caractere) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caractere];
        });
    }

    function icone(nome) {
        return `<svg class="icon" aria-hidden="true"><use href="#icon-${nome}"/></svg>`;
    }

    function escrever(id, texto) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = texto;
    }

    function alinharIndicadores() {
        const cena = document.querySelector('.scene');
        const imagem = cena.querySelector('img');
        if (!cena.clientWidth) return;
        // As coordenadas acompanham os pontos do viewBox 720 × 440, incluindo as margens do object-fit.
        const escala = Math.min(imagem.clientWidth / 720, imagem.clientHeight / 440);
        const margemX = imagem.offsetLeft + (imagem.clientWidth - 720 * escala) / 2;
        const margemY = imagem.offsetTop + (imagem.clientHeight - 440 * escala) / 2;
        const indicadores = [
            { classe: '.scene-label-soil', linha: 'linha-solo', pontoX: 251, pontoY: 261, destinoX: 91, destinoY: 253, solo: true },
            { classe: '.scene-label-air', linha: 'linha-ambiente', pontoX: 538, pontoY: 206, destinoX: 622, destinoY: 179, solo: false }
        ];
        indicadores.forEach(function (indicador) {
            const caixa = cena.querySelector(indicador.classe);
            const pontoX = margemX + indicador.pontoX * escala;
            const pontoY = margemY + indicador.pontoY * escala;
            const destinoX = margemX + indicador.destinoX * escala;
            const destinoY = margemY + indicador.destinoY * escala;
            const largura = caixa.offsetWidth;
            const altura = caixa.offsetHeight;
            const esquerda = Math.max(8, Math.min(cena.clientWidth - largura - 8, destinoX - (indicador.solo ? largura : 0)));
            const acima = !indicador.solo && esquerda < pontoX + 12;
            const topo = Math.max(8, acima ? pontoY - altura - 24 : destinoY - altura / 2);
            caixa.style.left = `${esquerda}px`;
            caixa.style.top = `${topo}px`;
            const finalX = esquerda + (acima ? largura / 2 : indicador.solo ? largura : 0);
            const finalY = topo + (acima ? altura : altura / 2);
            const meioX = (pontoX + finalX) / 2;
            const caminho = acima
                ? `M${pontoX},${pontoY} L${finalX},${pontoY - 12} V${finalY}`
                : `M${pontoX},${pontoY} L${meioX},${finalY} H${finalX}`;
            document.getElementById(indicador.linha).setAttribute('d', caminho);
        });
    }

    // Pequeno helper de fetch: já manda cookies de sessão, já lê o JSON de
    // erro que os controllers devolvem ({ erro: '...' }) e já transforma
    // uma resposta não-OK numa exceção com mensagem legível.
    async function api(url, opcoes) {
        const resposta = await fetch(url, Object.assign({ credentials: 'same-origin' }, opcoes));
        let corpo = null;
        try { corpo = await resposta.json(); } catch (erro) { corpo = null; }
        if (!resposta.ok) {
            const mensagem = (corpo && corpo.erro) ? corpo.erro : `Erro ${resposta.status} ao falar com o servidor.`;
            throw new Error(mensagem);
        }
        return corpo;
    }

    function obterPlanta() {
        return plantas.find(function (planta) { return planta.id_estufa === idEstufa; });
    }

    function obterEspecie(planta) {
        return especies.find(function (especie) { return especie.id_especie === planta.id_especie; }) || {};
    }

    function obterEstado(valor, metrica) {
        if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
            return { texto: 'Sem leitura ainda', atencao: false, semDado: true };
        }
        if (valor < metrica.minimo) return { texto: 'Abaixo da referência', atencao: true };
        if (valor > metrica.maximo) return { texto: 'Acima da referência', atencao: true };
        return { texto: 'Na faixa de referência', atencao: false };
    }

    function precisaAtencao(planta) {
        if (!planta.dadosAtuais) return false;
        const parametros = obterParametros(obterEspecie(planta));
        return Object.entries(parametros).some(function ([chave, metrica]) {
            return obterEstado(planta.dadosAtuais[chave], metrica).atencao;
        });
    }

    function mostrarMensagem(texto) {
        clearTimeout(temporizadorMensagem);
        escrever('mensagem', texto);
        temporizadorMensagem = setTimeout(function () { escrever('mensagem', ''); }, 6000);
    }

    function mudarPagina(destino, moverFoco) {
        pagina = destino;
        document.getElementById('pagina-inicio').hidden = destino !== 'inicio';
        document.getElementById('pagina-plantas').hidden = destino !== 'plantas';
        escrever('pagina-atual', destino === 'inicio' ? 'Visão geral' : 'Minhas plantas');
        escrever('titulo-pagina', destino === 'inicio' ? 'Meu cultivo' : 'Minhas plantas');
        escrever('subtitulo-pagina', destino === 'inicio' ? 'Acompanhe suas plantas e as condições do cultivo.' : 'Gerencie suas plantas, medidas e dispositivos.');
        document.querySelectorAll('[data-pagina]').forEach(function (botao) {
            const ativo = botao.dataset.pagina === destino;
            botao.classList.toggle('is-active', ativo);
            if (ativo) botao.setAttribute('aria-current', 'page');
            else botao.removeAttribute('aria-current');
        });
        if (moverFoco) document.getElementById('conteudo').focus();
    }

    function renderizarIndicadores() {
        const planta = obterPlanta();
        if (!planta) return;
        const parametros = obterParametros(obterEspecie(planta));
        const dados = planta.dadosAtuais;
        document.getElementById('indicadores').innerHTML = Object.entries(parametros).map(function ([chave, metrica]) {
            const valor = dados ? dados[chave] : null;
            const estado = obterEstado(valor, metrica);
            const textoValor = estado.semDado ? '—' : `${valor}<small> ${metrica.unidade}</small>`;
            const larguraBarra = estado.semDado ? 0 : Math.max(0, Math.min(100, valor / metrica.escala * 100));
            return `<button class="metric-card" data-parametro="${chave}" aria-pressed="${parametro === chave}" aria-controls="grafico" aria-label="${metrica.nome}: ${estado.semDado ? 'sem leitura ainda' : valor + ' ' + metrica.unidade}. ${estado.texto}. Ver histórico.">
                <span class="metric-top">${metrica.nome}${icone(metrica.icone)}</span>
                <span class="metric-value">${textoValor}</span>
                <span class="metric-status${estado.atencao ? ' attention' : ''}">${icone(estado.atencao ? 'info' : 'check')}${estado.texto}</span>
                <span class="metric-track" aria-hidden="true"><span style="width:${larguraBarra}%"></span></span>
                <span class="metric-hint">${metrica.descricao}</span>
            </button>`;
        }).join('');
    }

    async function renderizarHistorico() {
        const planta = obterPlanta();
        if (!planta) return;
        const parametros = obterParametros(obterEspecie(planta));
        const metrica = parametros[parametro];
        const periodo = document.getElementById('periodo').value;
        const visualizacao = document.getElementById('visualizacao').value;
        const descricaoPeriodo = { hoje: 'Hoje', semana: 'Últimos 7 dias', mes: 'Últimos 30 dias' }[periodo] || periodo;

        escrever('titulo-historico', `Histórico de ${metrica.nome.toLowerCase()}`);
        escrever('legenda-metrica', `${metrica.nome} (${metrica.unidade})`);

        let dados;
        try {
            dados = await api(`/dashboard/${planta.id_estufa}/dados?periodo=${periodo}&parametro=${parametro}`);
        } catch (erro) {
            document.getElementById('grafico').innerHTML = '<p class="chart-summary">Não foi possível carregar o histórico agora.</p>';
            escrever('resumo-historico', erro.message);
            return;
        }

        if (!dados || dados.length === 0) {
            document.getElementById('grafico').innerHTML = '<p class="chart-summary">Ainda não há leituras registradas para este período.</p>';
            escrever('resumo-historico', 'Assim que o Arduino enviar dados, o histórico aparece aqui.');
            return;
        }

        const valores = dados.map(function (item) { return item[parametro]; });
        const formatar = function (valor) { return valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 }); };
        const media = valores.reduce(function (total, valor) { return total + valor; }, 0) / valores.length;
        const resumo = `${descricaoPeriodo} · Média: ${formatar(media)} ${metrica.unidade}. Menor leitura: ${formatar(Math.min(...valores))} ${metrica.unidade}; maior: ${formatar(Math.max(...valores))} ${metrica.unidade}. Faixa de referência: ${metrica.minimo}–${metrica.maximo} ${metrica.unidade}.`;
        escrever('resumo-historico', resumo);
        const tabela = `<div class="table-scroll" tabindex="0" role="region" aria-label="Tabela de leituras"><table><caption>Leituras · ${descricaoPeriodo}</caption><thead><tr><th scope="col">${periodo === 'hoje' ? 'Horário' : 'Data'}</th><th scope="col">${metrica.nome}</th><th scope="col">Referência</th></tr></thead><tbody>${dados.map(function (item) { return `<tr><th scope="row">${item.periodo}</th><td>${formatar(item[parametro])} ${metrica.unidade}</td><td>${obterEstado(item[parametro], metrica).texto}</td></tr>`; }).join('')}</tbody></table></div>`;
        if (visualizacao === 'tabela') {
            document.getElementById('grafico').innerHTML = tabela;
            return;
        }
        const largura = Math.max(260, document.getElementById('grafico').clientWidth || 880);
        const altura = 220;
        const esquerda = 42;
        const direita = largura - 12;
        const topo = 15;
        const base = 184;
        const y = function (valor) { return base - valor / metrica.escala * (base - topo); };
        const passo = (direita - esquerda) / dados.length;
        const pontos = dados.map(function (item, indice) { return { x: esquerda + passo * (indice + .5), y: y(item[parametro]), valor: item[parametro], periodo: item.periodo }; });
        const grade = [0, .25, .5, .75, 1].map(function (fracao) {
            const posicao = y(fracao * metrica.escala);
            return `<line x1="${esquerda}" y1="${posicao}" x2="${direita}" y2="${posicao}" stroke="#284232" stroke-dasharray="3 5"/><text x="30" y="${posicao + 4}" text-anchor="end">${metrica.escala * fracao}</text>`;
        }).join('');
        const faixa = `<rect x="${esquerda}" y="${y(metrica.maximo)}" width="${direita - esquerda}" height="${y(metrica.minimo) - y(metrica.maximo)}" fill="#285037" opacity=".35"/><line x1="${esquerda}" x2="${direita}" y1="${y(metrica.minimo)}" y2="${y(metrica.minimo)}" stroke="#507a5f" stroke-dasharray="4 5"/>`;
        const caminho = pontos.map(function (ponto, indice) { return `${indice ? 'L' : 'M'}${ponto.x},${ponto.y}`; }).join(' ');
        const desenho = visualizacao === 'barras'
            ? pontos.map(function (ponto) { return `<rect x="${ponto.x - passo * .23}" y="${ponto.y}" width="${passo * .46}" height="${base - ponto.y}" rx="4" fill="#58c594"><title>${ponto.periodo}: ${formatar(ponto.valor)} ${metrica.unidade}</title></rect>`; }).join('')
            : `<defs><linearGradient id="preenchimento-grafico" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#39bd82" stop-opacity=".25"/><stop offset="1" stop-color="#39bd82" stop-opacity="0"/></linearGradient></defs><path d="${caminho} L${pontos[pontos.length - 1].x},${base} L${pontos[0].x},${base}Z" fill="url(#preenchimento-grafico)"/><path d="${caminho}" fill="none" stroke="#68d6a4" stroke-width="2.5" stroke-linejoin="round"/>${pontos.map(function (ponto) { return `<circle cx="${ponto.x}" cy="${ponto.y}" r="4" fill="#b5efd0" stroke="#0e271b" stroke-width="2"><title>${ponto.periodo}: ${formatar(ponto.valor)} ${metrica.unidade}</title></circle>`; }).join('')}`;
        const totalRotulos = Math.min(pontos.length, Math.max(3, Math.floor(largura / 80)));
        const indicesRotulos = new Set(Array.from({ length: totalRotulos }, function (_, indice) {
            return Math.round(indice * (pontos.length - 1) / (totalRotulos - 1));
        }));
        const rotulos = pontos.map(function (ponto, indice) { return indicesRotulos.has(indice) ? `<text x="${ponto.x}" y="211" text-anchor="middle">${ponto.periodo}</text>` : ''; }).join('');
        document.getElementById('grafico').innerHTML = `<svg viewBox="0 0 ${largura} ${altura}" role="img" aria-labelledby="titulo-grafico descricao-grafico"><title id="titulo-grafico">${metrica.nome}: leituras em ${visualizacao === 'linha' ? 'linhas' : 'barras'}</title><desc id="descricao-grafico">${resumo} Selecione Tabela no formato do histórico para acessar todas as leituras.</desc>${faixa}${grade}${desenho}${rotulos}</svg>`;
    }

    function renderizarCultivo() {
        const planta = obterPlanta();
        const seletor = document.getElementById('planta-selecionada');
        seletor.innerHTML = plantas.map(function (item) { return `<option value="${item.id_estufa}">${escaparTexto(item.nome_estufa)}</option>`; }).join('');
        seletor.disabled = !planta;
        document.getElementById('editar-planta').disabled = !planta;
        document.getElementById('cultivo-conteudo').hidden = !planta;
        document.getElementById('cultivo-vazio').hidden = Boolean(planta);
        if (!planta) {
            seletor.innerHTML = '<option>Nenhuma planta cadastrada</option>';
            return;
        }
        seletor.value = String(idEstufa);
        const dados = planta.dadosAtuais;
        const especie = obterEspecie(planta);
        const atencao = precisaAtencao(planta);
        const estado = document.getElementById('estado-cultivo');
        estado.classList.toggle('attention', atencao);
        estado.innerHTML = dados
            ? `${icone(atencao ? 'info' : 'check')}${atencao ? 'Verificar leituras' : 'Leituras na faixa'}`
            : `${icone('info')}Aguardando primeira leitura`;
        escrever('cena-umidade', dados ? `${dados.umidade_solo}%` : '—');
        escrever('cena-temperatura', dados ? `${dados.temperatura_ar} °C` : '—');
        escrever('dispositivo-nome', `Greenduino · token ${planta.token_estufa}`);
        escrever('dispositivo-ultima-leitura', dados ? `Última leitura: ${dados.ultima_atualizacao}` : 'Ainda sem leituras');
        escrever('titulo-cuidados', 'Resumo');
        const parametros = obterParametros(especie);
        if (!dados) {
            escrever('resumo-cultivo', 'Essa estufa ainda não enviou nenhuma leitura. Confira se o Arduino está ligado e com o token certo.');
        } else {
            const leiturasFora = Object.entries(parametros).filter(function ([chave, metrica]) {
                return obterEstado(dados[chave], metrica).atencao;
            });
            escrever('resumo-cultivo', atencao ? leiturasFora.map(function ([chave, metrica]) {
                return `${metrica.nome}: ${dados[chave]} ${metrica.unidade}, ${dados[chave] < metrica.minimo ? 'abaixo' : 'acima'} da referência.`;
            }).join(' ') : 'As três leituras estão na faixa de referência desta espécie.');
        }
        escrever('estado-bomba', dados && dados.bomba_acionada ? 'Irrigação em andamento' : 'Irrigação em espera');
        escrever('descricao-bomba', dados && dados.bomba_acionada ? 'Bomba ligada agora.' : 'Bomba desligada no momento.');
        escrever('nome-especie', especie.nome_especie || 'Espécie não encontrada');
        escrever('nome-cientifico', especie.nome_cientifico || '');
        renderizarIndicadores();
        renderizarHistorico();
    }

    function renderizarPlantas() {
        escrever('total-plantas', String(plantas.length));
        escrever('resumo-plantas', `${plantas.length} ${plantas.length === 1 ? 'planta cadastrada' : 'plantas cadastradas'}.`);
        const lista = document.getElementById('lista-plantas');
        if (!plantas.length) {
            lista.innerHTML = `<div class="empty-state">${icone('leaf')}<h2>Nenhuma planta cadastrada</h2><p>Cadastre uma planta para acompanhar seus indicadores.</p><button class="button button-primary" data-cadastrar>Cadastrar planta</button></div>`;
            return;
        }
        lista.innerHTML = plantas.map(function (planta) {
            const semDados = !planta.dadosAtuais;
            const atencao = precisaAtencao(planta);
            const nome = escaparTexto(planta.nome_estufa);
            const especie = obterEspecie(planta);
            const status = semDados ? 'Aguardando leitura' : (atencao ? 'Vale conferir' : 'Em equilíbrio');
            return `<article class="plant-card"><div class="plant-art"><img src="/assets/images/planta-dashboard.svg" alt="" width="145" height="145"></div><div class="plant-details"><span class="status-pill${!semDados && atencao ? ' attention' : ''}">${icone(semDados || atencao ? 'info' : 'check')}${status}</span><h3>${nome}</h3><p>${especie.nome_especie || 'Espécie não encontrada'}</p><span class="plant-device">${icone('chip')}Token ${escaparTexto(planta.token_estufa)}</span></div><div class="plant-actions"><button class="text-button" data-acompanhar="${planta.id_estufa}" aria-label="Acompanhar ${nome}">Acompanhar ${icone('arrow')}</button><button class="icon-button" data-editar="${planta.id_estufa}" aria-label="Editar ${nome}">${icone('edit')}</button><button class="icon-button danger" data-excluir="${planta.id_estufa}" aria-label="Excluir ${nome}">${icone('trash')}</button></div></article>`;
        }).join('');
    }

    function abrirModal(modal) {
        botaoOrigem = document.activeElement;
        modal.showModal();
    }


    function alternarModoCultivo() {
        const ehHorta = campoModoCultivo.value === 'HORTA';
        blocoTamanhoVaso.hidden = ehHorta;
        blocoAreaHorta.hidden = !ehHorta;
        campoTamanhoVaso.required = !ehHorta;
        campoAreaHorta.required = ehHorta;
    }

    function abrirFormulario(id) {
        const planta = plantas.find(function (item) { return item.id_estufa === id; });
        formulario.reset();
        campoNome.setCustomValidity('');
        campoDispositivo.setCustomValidity('');
        escrever('erro-formulario', '');
        document.getElementById('id_estufa').value = planta ? planta.id_estufa : '';
        escrever('titulo-formulario', planta ? 'Editar planta' : 'Cadastrar planta');
        escrever('salvar-planta', planta ? 'Salvar alterações' : 'Cadastrar planta');
        campoEspecie.innerHTML = '<option value="">Selecione a espécie</option>' + especies.map(function (especie) { return `<option value="${especie.id_especie}">${especie.nome_especie}</option>`; }).join('');
        if (planta) {
            campoNome.value = planta.nome_estufa;
            campoEspecie.value = String(planta.id_especie);
            campoDispositivo.value = planta.token_estufa;
            campoModoCultivo.value = planta.modo_cultivo || 'VASO';
            campoTamanhoVaso.value = planta.tamanho_vaso || 'M';
            campoAreaHorta.value = planta.area_m2 != null ? planta.area_m2 : '';
            campoVazaoBomba.value = planta.vazao_bomba_ml_s != null ? planta.vazao_bomba_ml_s : '';
        } else {
            campoModoCultivo.value = 'VASO';
            campoTamanhoVaso.value = 'M';
            campoAreaHorta.value = '';
        }
        alternarModoCultivo();
        abrirModal(modalPlanta);
        campoNome.focus();
    }

    campoModoCultivo.addEventListener('change', alternarModoCultivo);


    async function carregarPlantas() {
        const estufas = await api(`/api/estufas/usuario/${GREENDUINO.idUsuario}`);
        plantas = await Promise.all(estufas.map(async function (estufa) {
            if (estufa.id_estufa === GREENDUINO.idEstufaInicial && GREENDUINO.dadosAtuaisIniciais !== undefined) {
                return Object.assign({}, estufa, { dadosAtuais: GREENDUINO.dadosAtuaisIniciais });
            }
            try {
                const dadosAtuais = await api(`/dashboard/${estufa.id_estufa}/atual`);
                return Object.assign({}, estufa, { dadosAtuais: dadosAtuais });
            } catch (erro) {
                return Object.assign({}, estufa, { dadosAtuais: null });
            }
        }));
    }


    async function selecionarPlanta(novoId) {
        idEstufa = novoId;
        renderizarCultivo();
        try {
            const atual = await api(`/dashboard/${novoId}/atual`);
            const planta = plantas.find(function (item) { return item.id_estufa === novoId; });
            if (planta) planta.dadosAtuais = atual;
        } catch (erro) {
           
        }
        if (idEstufa === novoId) renderizarCultivo();
    }

    campoNome.addEventListener('input', function () { campoNome.setCustomValidity(''); });
    campoDispositivo.addEventListener('input', function () { campoDispositivo.setCustomValidity(''); });
    formulario.addEventListener('submit', async function (evento) {
        evento.preventDefault();
        const nome = campoNome.value.trim();
        if (!nome) {
            campoNome.setCustomValidity('Dê um nome à sua planta.');
            campoNome.reportValidity();
            return;
        }
        const id = Number(document.getElementById('id_estufa').value) || null;
        const token = campoDispositivo.value.trim();
        if (!token) {
            campoDispositivo.setCustomValidity('Informe o código do token do seu Greenduino.');
            campoDispositivo.reportValidity();
            return;
        }
        if (!formulario.reportValidity()) return;
        if (!campoEspecie.value) {
            escrever('erro-formulario', 'Selecione uma espécie para sua planta.');
            return;
        }

        const ehHorta = campoModoCultivo.value === 'HORTA';
        if (ehHorta && !(Number(campoAreaHorta.value) > 0)) {
            escrever('erro-formulario', 'Informe a área da horta em m² (maior que zero).');
            return;
        }

        const corpo = {
            nome_estufa: nome,
            id_especie: Number(campoEspecie.value),
            token_estufa: token,
            modo_cultivo: campoModoCultivo.value,
            tamanho_vaso: campoTamanhoVaso.value,
            area_m2: ehHorta ? Number(campoAreaHorta.value) : null,
            vazao_bomba_ml_s: campoVazaoBomba.value ? Number(campoVazaoBomba.value) : null
        };

        botaoSalvar.disabled = true;
        escrever('erro-formulario', '');
        try {
            if (id) {
                await api(`/api/estufas/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
            } else {
                const resultado = await api('/api/estufas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
                idEstufa = resultado.id_estufa;
            }
            await carregarPlantas();
            if (id) idEstufa = id;
            renderizarCultivo();
            renderizarPlantas();
            modalPlanta.close();
            mostrarMensagem(id ? 'Cadastro atualizado.' : 'Planta cadastrada!');
        } catch (erro) {
            escrever('erro-formulario', erro.message);
        } finally {
            botaoSalvar.disabled = false;
        }
    });

    document.addEventListener('click', function (evento) {
        const botao = evento.target.closest('button');
        if (!botao) return;
        if (botao.hasAttribute('data-cadastrar')) abrirFormulario(null);
        if (botao.hasAttribute('data-editar')) abrirFormulario(Number(botao.dataset.editar));
        if (botao.hasAttribute('data-excluir')) {
            idExcluir = Number(botao.dataset.excluir);
            const planta = plantas.find(function (item) { return item.id_estufa === idExcluir; });
            escrever('descricao-excluir', `“${planta.nome_estufa}” será removida, junto com o token cadastrado. Essa ação não pode ser desfeita.`);
            abrirModal(modalExcluir);
        }
        if (botao.hasAttribute('data-fechar')) botao.closest('dialog').close();
        if (botao.hasAttribute('data-ajuda')) abrirModal(document.getElementById('modal-ajuda'));
        if (botao.dataset.pagina) mudarPagina(botao.dataset.pagina, true);
        if (botao.dataset.acompanhar) {
            selecionarPlanta(Number(botao.dataset.acompanhar));
            mudarPagina('inicio', true);
        }
        if (botao.dataset.parametro) {
            parametro = botao.dataset.parametro;
            document.querySelectorAll('[data-parametro]').forEach(function (item) { item.setAttribute('aria-pressed', String(item.dataset.parametro === parametro)); });
            renderizarHistorico();
        }
        ['metricas', 'plantas'].forEach(function (grupo) {
            if (!botao.dataset[grupo]) return;
            document.querySelectorAll(`[data-${grupo}]`).forEach(function (item) { item.setAttribute('aria-pressed', String(item === botao)); });
            document.getElementById(grupo === 'metricas' ? 'indicadores' : 'lista-plantas').classList.toggle('is-list', botao.dataset[grupo] === 'lista');
        });
    });

    document.getElementById('confirmar-exclusao').addEventListener('click', async function () {
        const botaoConfirmar = this;
        botaoConfirmar.disabled = true;
        try {
            await api(`/api/estufas/${idExcluir}`, { method: 'DELETE' });
            await carregarPlantas();
            if (!obterPlanta()) {
                idEstufa = plantas.length ? plantas[0].id_estufa : null;
            }
            renderizarCultivo();
            renderizarPlantas();
            modalExcluir.close();
            mostrarMensagem('Planta excluída.');
        } catch (erro) {
            mostrarMensagem('Não foi possível excluir: ' + erro.message);
        } finally {
            botaoConfirmar.disabled = false;
            idExcluir = null;
        }
    });
    document.getElementById('editar-planta').addEventListener('click', function () { abrirFormulario(idEstufa); });
    document.getElementById('planta-selecionada').addEventListener('change', async function (evento) {
        await selecionarPlanta(Number(evento.target.value));
        const planta = obterPlanta();
        if (planta) mostrarMensagem(`Agora acompanhando ${planta.nome_estufa}.`);
    });
    document.getElementById('periodo').addEventListener('change', renderizarHistorico);
    document.getElementById('visualizacao').addEventListener('change', renderizarHistorico);
    document.querySelectorAll('dialog').forEach(function (modal) {
        modal.addEventListener('close', function () {
            if (botaoOrigem && botaoOrigem.isConnected) botaoOrigem.focus();
            else document.querySelector(`[data-pagina="${pagina}"]`).focus();
        });
    });

    async function iniciar() {
        try {
            especies = await api('/api/especies');
        } catch (erro) {
            especies = [];
            mostrarMensagem('Não foi possível carregar a lista de espécies: ' + erro.message);
        }

        try {
            await carregarPlantas();
        } catch (erro) {
            plantas = [];
            mostrarMensagem('Não foi possível carregar suas plantas: ' + erro.message);
        }

        if (!idEstufa && plantas.length) idEstufa = plantas[0].id_estufa;

        renderizarCultivo();
        renderizarPlantas();

        const observadorCena = new ResizeObserver(alinharIndicadores);
        document.querySelectorAll('.scene, .scene-label').forEach(function (elemento) { observadorCena.observe(elemento); });
        let larguraGrafico = 0;
        new ResizeObserver(function (entradas) {
            const largura = entradas[0].contentRect.width;
            if (largura > 0 && largura !== larguraGrafico) {
                larguraGrafico = largura;
                renderizarHistorico();
            }
        }).observe(document.getElementById('grafico'));
    }

    iniciar();
});
