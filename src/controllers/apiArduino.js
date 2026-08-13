const db = require('../config/database'); // requerimento da conexão com o banco de dados

const salvarTelemtria = async (request, response) => { //função assincrona para salvar dados no banco de dados
    try {
        const { temperatura_ar, umidade_ar, umidade_solo, bomba_acionada } = request.body;

      if (temperatura_ar === undefined || umidade_ar === undefined || umidade_solo === undefined) {
            return response.status(400).json({ 
                error: 'Parâmetros temperatura_ar, umidade_ar e umidade_solo são obrigatórios.' 
            });
        }
        const statusBomba = bomba_acionada ?? 0;
    }
};