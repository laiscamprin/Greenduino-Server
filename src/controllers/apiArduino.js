const connectionFactory = require('../config/connectionFactory');
const greenduinoBanco = require('../config/greenduinoBanco')(); 


module.exports = {

    recepcaoTelemetria: function(request, response) {

        const { temperatura_ar, umidade_ar, umidade_solo, bomba_acionada } = request.body;

        if (temperatura_ar === undefined || umidade_ar === undefined || umidade_solo === undefined) {
            return response.status(400).json({ erro: 'Dados incompletos. Verifique os sensores.' });
        }

        const dadosInsert= {
            temperatura_ar: temperatura_ar,
            umidade_ar: umidade_ar,
            umidade_solo: umidade_solo,
            bomba_acionada: bomba_acionada || 0,
        };

        const conexao = connectionFactory(); //corrigir isso
        conexao.query(sql, dadosInsert, callback); //corrigir isso

        greenduinoBanco.insertTelemetria(dadosInsert, conexao, function(err, resultado) {
  
            conexao.end();

            if (err) {
                console.log('Erro ao salvar no banco:', err);
                return response.status(500).json({ erro: 'Erro ao salvar telemetria.' });
            }

            res.status(201).json({ mensagem: 'Telemetria gravada' });
        });
    }, 



    enviarConfiguracoes: function(request, response) {
       
        const conexao = connectionFactory(); 

        greenduinoBanco.envioParametros(conexao, function(err, results) {
      
            conexao.end(); 
            
            if (err) {
                console.log('Erro ao buscar configurações:', err);
                return response.status(500).json({ err: 'Erro interno do servidor.' });
            }

			      if (results.length === 0) {
                return response.status(404).json({ err: 'Parâmetro não encontrado' });
            }

            return response.status(200).json(results[0]);
        });
    }
};
