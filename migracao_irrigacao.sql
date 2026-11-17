-- Migração para quem já tem o banco greenduino_db criado (não apaga nem
-- renomeia nada que já existe, só adiciona colunas). Rode isso UMA VEZ.
--
-- Se o seu banco for novo, não precisa rodar este arquivo: ele já está
-- refletido direto em bancoGreenduino.sql.

USE greenduino_db;

ALTER TABLE especies
    ADD COLUMN temperatura_ideal  DECIMAL(10,2) NULL AFTER temperatura_minima,
    ADD COLUMN temperatura_maxima DECIMAL(10,2) NULL AFTER temperatura_ideal,
    ADD COLUMN umidade_ideal      DECIMAL(10,2) NULL AFTER umidade_minima,
    ADD COLUMN umidade_maxima     DECIMAL(10,2) NULL AFTER umidade_ideal;

ALTER TABLE estufas
    ADD COLUMN tamanho_vaso ENUM('P','M','G') NOT NULL DEFAULT 'M' AFTER id_especie,
    ADD COLUMN vazao_bomba_ml_s DECIMAL(10,2) NULL AFTER tamanho_vaso,
    -- tempo_irrigacao passou a guardar milissegundos (não segundos/float
    -- pequeno), então o tamanho antigo DECIMAL(5,2) (máximo 999.99) estourava.
    MODIFY COLUMN tempo_irrigacao DECIMAL(10,2);

-- Espécies já cadastradas ficam com umidade_ideal/temperatura_ideal etc em
-- NULL até você preencher (pela tela de espécies ou direto um UPDATE).
-- Enquanto umidade_ideal estiver NULL para uma espécie, o cálculo de
-- irrigação (irrigacaoService.js) devolve tempo_irrigacao_ms = 0 em vez de
-- inventar um valor - ou seja, a rega automática fica "desarmada" com
-- segurança pra essa espécie até você completar a faixa ideal dela.
