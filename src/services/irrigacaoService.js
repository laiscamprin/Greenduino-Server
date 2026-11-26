
const LITROS_POR_TAMANHO_VASO = {
    P: 2,  
    M: 5,  
    G: 15  
};

const FATOR_CAPACIDADE_SUBSTRATO = 0.3;
const VAZAO_PADRAO_ML_S = 10;

const PROFUNDIDADE_MOLHADA_HORTA_M = 0.2;
function litrosDoVaso(tamanhoVaso) {
    return LITROS_POR_TAMANHO_VASO[tamanhoVaso] || LITROS_POR_TAMANHO_VASO.M;
}

function litrosDaHorta(areaM2) {
    const area = Number(areaM2);
    if (!Number.isFinite(area) || area <= 0) return 0;
    return area * PROFUNDIDADE_MOLHADA_HORTA_M * 1000;
}

/**
 * volume_agua_mL = volume_vaso_L * FATOR_CAPACIDADE_SUBSTRATO * (deficit_% / 100) * 1000
 * tempo_ms       = (volume_agua_mL / vazao_mL_por_s) * 1000
 *
 * @param {Object} params
 * @param {number} params.umidade_minima   
 * @param {number} params.umidade_ideal   
 * @param {string} [params.modo_cultivo]   
 * @param {string} [params.tamanho_vaso]   
 * @param {number} [params.area_m2]       
 * @param {number} params.vazao_bomba_ml_s 
 * @returns {number} 
 */
function calcularTempoIrrigacaoMs({ umidade_minima, umidade_ideal, modo_cultivo, tamanho_vaso, area_m2, vazao_bomba_ml_s }) {
    const minima = Number(umidade_minima);
    const ideal = Number(umidade_ideal);
    const vazao = Number(vazao_bomba_ml_s) > 0 ? Number(vazao_bomba_ml_s) : VAZAO_PADRAO_ML_S;

    if (!Number.isFinite(minima) || !Number.isFinite(ideal) || ideal <= minima) {
        return 0;
    }

    const volumeReservatorioLitros = modo_cultivo === 'HORTA'
        ? litrosDaHorta(area_m2)
        : litrosDoVaso(tamanho_vaso);


    if (volumeReservatorioLitros <= 0) {
        return 0;
    }

    const deficitFracao = (ideal - minima) / 100;
    const volumeAguaMl = volumeReservatorioLitros * FATOR_CAPACIDADE_SUBSTRATO * deficitFracao * 1000;
    const tempoMs = Math.round((volumeAguaMl / vazao) * 1000);

    return tempoMs > 0 ? tempoMs : 0;
}

module.exports = {
    calcularTempoIrrigacaoMs,
    litrosDoVaso,
    litrosDaHorta,
    LITROS_POR_TAMANHO_VASO,
    FATOR_CAPACIDADE_SUBSTRATO,
    PROFUNDIDADE_MOLHADA_HORTA_M,
    VAZAO_PADRAO_ML_S
};
