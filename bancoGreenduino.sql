CREATE DATABASE greenduino_db;
USE  greenduino_db;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome_usuario VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(25) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL 
    );

 CREATE TABLE especies (
    id_especie INT AUTO_INCREMENT PRIMARY KEY,
    nome_especie VARCHAR(255) NOT NULL,
    nome_cientifico VARCHAR(255) NOT NULL,
    -- Faixa de temperatura do AR ideal para a espécie (usada hoje só para
    -- exibir/alertar no dashboard).
    temperatura_minima DECIMAL(10,2),
    temperatura_ideal DECIMAL(10,2),
    temperatura_maxima DECIMAL(10,2),
    -- Faixa de umidade do SOLO ideal para a espécie: umidade_minima é o
    -- gatilho que dispara a irrigação (comparado à leitura do higrômetro),
    -- umidade_ideal é o alvo que o cálculo de irrigação tenta atingir, e
    -- umidade_maxima é usada para alertar excesso de água.
    umidade_minima DECIMAL(10,2),
    umidade_ideal DECIMAL(10,2),
    umidade_maxima DECIMAL(10,2)
    );

CREATE TABLE estufas (
    id_estufa INT AUTO_INCREMENT PRIMARY KEY,
    nome_estufa VARCHAR(255) NOT NULL,
    id_usuario INT NOT NULL,
    id_especie INT NOT NULL,
    -- Categoria do vaso (ver LITROS_POR_TAMANHO_VASO em irrigacaoService.js)
    -- e vazão real da bomba instalada nessa estufa (mL por segundo) - os
    -- dois entram no cálculo de quanto tempo irrigar.
    tamanho_vaso ENUM('P','M','G') NOT NULL DEFAULT 'M',
    vazao_bomba_ml_s DECIMAL(10,2),
    -- Cache do último tempo de irrigação calculado, só para exibição rápida
    -- (listagem/dashboard). O valor realmente usado para acionar a bomba é
    -- sempre recalculado na hora em GET /api/parametros/:token_estufa.
    tempo_irrigacao DECIMAL(10,2),
    token_estufa VARCHAR(255) UNIQUE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_especie) REFERENCES especies(id_especie)
    );



CREATE TABLE dados (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_estufa INT NOT NULL,
    temperatura_ar DECIMAL(10,2),
    umidade_ar DECIMAL(10,2),
    umidade_solo DECIMAL(10,2),
    bomba_acionada BOOLEAN NOT NULL,
	data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_estufa) REFERENCES estufas (id_estufa)
    );

SELECT*FROM usuarios;

INSERT INTO usuarios (nome_usuario, email, telefone, senha) VALUES ('Lais','lais@lais.com', '11972424166', '1234');