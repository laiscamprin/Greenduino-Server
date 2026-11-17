// Cálculo do tempo de irrigação (quanto tempo a bomba deve ficar ligada),
// proporcional ao tamanho do vaso e à faixa de umidade ideal da espécie.
//
// Lógica:
//  - O GATILHO de quando regar continua sendo "umidade do solo < umidade_minima
//    da espécie" (isso já existia e continua decidido localmente pelo Arduino
//    receptor, usando a leitura do higrômetro).
//  - A DURAÇÃO da rega (o que este módulo calcula) é o volume de água
//    necessário para levar o solo de umidade_minima até umidade_ideal,
//    proporcional ao volume do vaso, dividido pela vazão da bomba.

// Volume aproximado (em litros) de cada categoria de vaso. São valores de
// referência para vasos comuns — ajuste aqui se os vasos reais forem muito
// diferentes disso.
const LITROS_POR_TAMANHO_VASO = {
    P: 2,   // vaso pequeno (~15 cm de diâmetro)
    M: 5,   // vaso médio   (~20-25 cm de diâmetro)
    G: 15   // vaso grande  (~35-40 cm de diâmetro / balde de muda)
};

// Fração do volume do vaso que o substrato consegue reter como água quando
// está saturado (capacidade de campo). ~30% é uma aproximação razoável para
// terra/substrato comum de vaso. Isso é uma estimativa de engenharia, não um
// valor de laboratório — sirva-se dela como ponto de partida e ajuste depois
// observando se a planta fica encharcada ou se continua seca após a rega.
const FATOR_CAPACIDADE_SUBSTRATO = 0.3;

// Vazão (mL/s) usada só quando a estufa ainda não tem vazao_bomba_ml_s
// cadastrada. Troque pela vazão real da sua bomba assim que souber (meça,
// por exemplo, quantos mL ela puxa em 10 segundos e divida por 10).
const VAZAO_PADRAO_ML_S = 50;

function litrosDoVaso(tamanhoVaso) {
    return LITROS_POR_TAMANHO_VASO[tamanhoVaso] || LITROS_POR_TAMANHO_VASO.M;
}

/**
 * Calcula por quanto tempo (em ms) a bomba deve ficar ligada para levar o
 * solo da umidade mínima até a umidade ideal da espécie, proporcional ao
 * volume do vaso e à vazão real da bomba instalada naquela estufa.
 *
 * volume_agua_mL = volume_vaso_L * FATOR_CAPACIDADE_SUBSTRATO * (deficit_% / 100) * 1000
 * tempo_ms       = (volume_agua_mL / vazao_mL_por_s) * 1000
 *
 * @param {Object} params
 * @param {number} params.umidade_minima   umidade_minima da espécie (gatilho, em %)
 * @param {number} params.umidade_ideal    umidade_ideal da espécie (alvo, em %)
 * @param {string} params.tamanho_vaso     'P' | 'M' | 'G'
 * @param {number} params.vazao_bomba_ml_s vazão da bomba da estufa, em mL/s
 * @returns {number} tempo de irrigação em milissegundos (0 se não der pra calcular)
 */
function calcularTempoIrrigacaoMs({ umidade_minima, umidade_ideal, tamanho_vaso, vazao_bomba_ml_s }) {
    const minima = Number(umidade_minima);
    const ideal = Number(umidade_ideal);
    const vazao = Number(vazao_bomba_ml_s) > 0 ? Number(vazao_bomba_ml_s) : VAZAO_PADRAO_ML_S;

    // Sem faixa configurada (ou faixa inválida, ideal <= minima): não dá pra
    // calcular uma dose de água coerente, então não irriga automaticamente
    // em vez de regar com um valor arbitrário.
    if (!Number.isFinite(minima) || !Number.isFinite(ideal) || ideal <= minima) {
        return 0;
    }

    const volumeVasoLitros = litrosDoVaso(tamanho_vaso);
    const deficitFracao = (ideal - minima) / 100;
    const volumeAguaMl = volumeVasoLitros * FATOR_CAPACIDADE_SUBSTRATO * deficitFracao * 1000;
    const tempoMs = Math.round((volumeAguaMl / vazao) * 1000);

    return tempoMs > 0 ? tempoMs : 0;
}

module.exports = {
    calcularTempoIrrigacaoMs,
    litrosDoVaso,
    LITROS_POR_TAMANHO_VASO,
    FATOR_CAPACIDADE_SUBSTRATO,
    VAZAO_PADRAO_ML_S
};
