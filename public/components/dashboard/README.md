# Dashboard visual

Acesse `http://localhost:3000/dashboard` após executar `node server.js` na raiz do projeto. A rota renderiza a view sem exigir login, consultar dados ou receber variáveis do servidor.

## Organização

A montagem segue a home: uma view EJS com placeholders, carregamento pelo `public/utils/loadComponents.js` e inicialização no evento `componentsLoaded`.

- `src/views/dashboard/index.ejs`: estrutura da página.
- `public/css/dashboard.css`: estilos comuns e importação dos estilos dos componentes.
- `public/components/dashboard/`: menu, cultivo (inclui resumo), indicadores, histórico, plantas e modais, cada um com HTML e CSS próprios; ícones compartilhados em `icones.html`.
- `public/components/dashboard/dashboard.js`: dados simulados e interações da página.
- `src/routes/dashboard.js`: rota pública da página; a API existente mantém sua autenticação.

## Escopo

- HTML, CSS, SVG e JavaScript nativos, sem bibliotecas adicionais.
- Cadastro, edição e exclusão em memória; recarregar restaura os exemplos.
- Medidas obrigatórias do vaso ou área de cultivo: altura, largura e comprimento em centímetros, com valores positivos e uma casa decimal.
- Token digitado em um campo de texto livre, sem lista de dispositivos ou limite de oito cadastros. A demonstração apenas evita associar o mesmo token a duas plantas; não verifica nem conecta unidades reais.
- Seleção de planta, indicadores em cartões/lista, histórico em linhas/barras/tabela e três períodos.
- Navegação por teclado, diálogos nativos, mensagens acessíveis, estados vazios e layout responsivo.
- Nenhuma chamada às APIs, comando de irrigação, alteração de sessão ou gravação no banco.

## Futura integração

Os campos `id_estufa`, `nome_estufa`, `id_especie` e `token_estufa` acompanham o modelo existente de estufas. O nome da planta aparece como `nome_estufa`, pois hoje uma estufa é o cadastro associado à espécie. Os tokens `DEMO-*` são identificadores fictícios, não credenciais reais. As métricas preservam `temperatura_ar`, `umidade_ar`, `umidade_solo` e `bomba_acionada`.

Os novos campos `altura`, `largura` e `comprimento` são números em centímetros mantidos apenas no estado local e recuperados ao editar. Eles ainda não fazem parte do banco ou da API. O token informado também permanece apenas em memória.

Os dados e as faixas ilustrativas estão no início de `dashboard.js`. As datas do histórico são fixas e indicadas na interface. Nenhuma faixa representa uma recomendação agronômica. Substituir o estado local pelas respostas da API é uma etapa futura.

