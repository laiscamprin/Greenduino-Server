

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
    temperatura_minima DECIMAL(10,2),s
    umidade_minima DECIMAL(10,2)
    );
    
CREATE TABLE estufas (
    id_estufa INT AUTO_INCREMENT PRIMARY KEY,
    nome_estufa VARCHAR(255) NOT NULL,
    id_usuario INT NOT NULL,
    id_especie INT NOT NULL,
    token_estufa VARCHAR(255) UNIQUE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_especie) REFERENCES especies(id_especie)
    );

ALTER TABLE estufas ADD tempo_irrigacao DECIMAL(5,2);

    
RENAME TABLE logs_sensor TO dados;

CREATE TABLE logs_sensor (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_estufa INT NOT NULL,
    temperatura_ar DECIMAL(10,2),
    umidade_ar DECIMAL(10,2),
    umidade_solo DECIMAL(10,2),
    bomba_acionada BOOLEAN NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_estufa) REFERENCES estufas(id_estufa)
    );