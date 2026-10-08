const connectionFactory = require('../config/connectionFactory');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const usuariosBanco = require('../config/usuariosBanco')();

module.exports = {


    renderCadastro: function(req, res) {
        res.render('autenticacao/registro', { errosValidacao: {}, usuario: {} });
    },

    cadastrarUsuario: [
        check('nome').notEmpty().withMessage('O nome é obrigatório!').trim(),
        check('email').isEmail().withMessage('Informe um e-mail válido!').trim(),
        check('senha').isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres!'),
        check('confirmarSenha').custom((value, { req }) => {
            if (value !== req.body.senha) {
                throw new Error('As senhas digitadas não são iguais!');
            }
            return true;
        }),

        function(req, res, next) {
            var usuario = req.body;
            var erros = validationResult(req);

            if (!erros.isEmpty()) {
                return res.status(400).render('autenticacao/registro', {
                    errosValidacao: erros.mapped(),
                    usuario: usuario
                });
            }

            var connection = connectionFactory();

            usuariosBanco.buscaPorEmail(usuario.email, connection, function(err, results) {
                if (err) {
                    connection.end();
                    return next(err);
                }

                if (results.length > 0) {
                    connection.end();
                    return res.status(400).render('autenticacao/registro', {
                        errosValidacao: { email: { msg: 'Este e-mail já está cadastrado!' } },
                        usuario: usuario
                    });
                }

                delete usuario.confirmarSenha;
        
                usuariosBanco.salva(usuario, connection, function(err, results) {
                    connection.end();
                    if (err) return next(err);
                    res.redirect('/login');
                });
            });
        }
    ],

    renderLogin: function(req, res) {
        res.render('autenticacao/login', { erro: null });
    },

    login: function(req, res, next) {
        var email = req.body.email;
        var senha = req.body.senha;

        const agora = Date.now();
        const tempoBloqueio = 1 * 60 * 1000; 

        if (req.session.tentativasLogin && agora < req.session.tentativasLogin) {
            const segundosRestantes = Math.ceil((req.session.tentativasLogin - agora) / 1000);
            const min = Math.floor(segundosRestantes / 60);
            const seg = segundosRestantes % 60;

            return res.render('autenticacao/login', { 
                erro: `Seu acesso foi bloqueado devido a várias tentativas. Tente novamente em ${min}m ${seg}s.` 
            });
        }

        if (req.session.tentativasLogin && agora >= req.session.tentativasLogin) {
            delete req.session.tentativasLogin;
            req.session.tentativas = 0;
        }

        var connection = connectionFactory();

        usuariosBanco.buscaPorEmail(email, connection, function(err, results) {
            if (err) {
                connection.end();
                return next(err);
            }

            if (results.length === 0) {
                connection.end();
                return res.render('autenticacao/login', { erro: 'E-mail ou senha inválidos!' });
            }

            var usuario = results[0];
            var senhaValida = bcrypt.compareSync(senha, usuario.senha);

            if (!senhaValida) {
                req.session.tentativas = (req.session.tentativas || 0) + 1;
                var mensagem = 'E-mail ou senha inválidos!';

                if (req.session.tentativas >= 3) {
                    req.session.tentativasLogin = Date.now() + tempoBloqueio;
                    mensagem = 'Você errou a senha 3 vezes. Seu acesso foi bloqueado por 5 minutos.';
                } else {
                    var restantes = 3 - req.session.tentativas;
                    mensagem = `E-mail ou senha inválidos! Você tem mais ${restantes} tentativa(s).`;
                }

                connection.end();
                return res.render('autenticacao/login', { erro: mensagem });
            }

            req.session.tentativas = 0;
            delete req.session.tentativasLogin;

            req.session.usuario = {
                id: usuario.id_usuario || usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                admin: usuario.admin
            };

            connection.end(); 
            res.redirect('/produtos');
        });
    },

    renderPerfil: function(req, res, next) {
        if (!req.session.usuario) {
            return res.redirect('/login');
        }
        res.render('autenticacao/meu-perfil', { 
            usuario: req.session.usuario, 
            erroSenha: null, 
            erroNome: null, 
            errosValidacao: {} 
        });
    },

    editarPerfil: [
        check('senha').notEmpty().withMessage('A senha atual é necessária para confirmar as alterações').trim(),
        check('nome').notEmpty().withMessage('O nome é obrigatório!').trim(),

        function(req, res, next) {
            const erroPerfil = validationResult(req);
            if (!erroPerfil.isEmpty()) {
                return res.render('autenticacao/meu-perfil', { 
                    erroNome: null, 
                    erroSenha: null, 
                    usuario: req.session.usuario, 
                    errosValidacao: erroPerfil.mapped() 
                });
            }

            const nome = req.body.nome;
            const id = req.session.usuario.id;
            const senha = req.body.senha;

            const connection = connectionFactory();

            usuariosBanco.verificarSenha(id, connection, function(err, results) {
                if (err) {
                    connection.end();
                    return res.status(500).send("Erro ao verificar senha.");
                }

                if (results.length === 0) {
                    connection.end();
                    return res.render('autenticacao/meu-perfil', { 
                        erroNome: 'Usuário não encontrado.', 
                        erroSenha: null, 
                        usuario: req.session.usuario, 
                        errosValidacao: {} 
                    });
                }

                const senhaEncontrada = results[0];
                const senhaValidada = bcrypt.compareSync(senha, senhaEncontrada.senha);

                if (!senhaValidada) {
                    connection.end();
                    return res.render('autenticacao/meu-perfil', { 
                        erroNome: 'Senha atual incorreta.', 
                        erroSenha: null, 
                        usuario: req.session.usuario, 
                        errosValidacao: {} 
                    });
                }

                const dados = { nome: nome, id: id };
                usuariosBanco.alterarNome(dados, connection, function(err, results) {
                    connection.end();
                    if (err) {
                        return res.status(500).send("Erro ao alterar nome no banco: " + err);
                    }

                    req.session.usuario.nome = nome;
                    res.redirect('/perfil');
                });
            });
        }
    ],


    renderSenha: function(req, res) {
        if (!req.session.usuario) {
            return res.redirect('/login');
        }
        res.render('autenticacao/meu-perfil', { 
            usuario: req.session.usuario, 
            erroSenha: null, 
            erroNome: null, 
            errosValidacao: {} 
        });
    },

    alterarSenha: [
        check('senha').notEmpty().withMessage('A senha atual é obrigatória').trim(),
        check('senhaNova').isLength({ min: 6 }).withMessage('A nova senha deve ter no mínimo 6 caracteres!'),
        check('confirmarSenha').custom((value, { req }) => {
            if (value !== req.body.senhaNova) {
                throw new Error('As senhas digitadas não são iguais!');
            }
            return true;
        }),

        function(req, res, next) {
            const erroSenha = validationResult(req);
            if (!erroSenha.isEmpty()) {
                return res.render('autenticacao/meu-perfil', { 
                    erroSenha: null, 
                    erroNome: null, 
                    usuario: req.session.usuario, 
                    errosValidacao: erroSenha.mapped() 
                });
            }

            const senha = req.body.senha;
            const id = req.session.usuario.id;
            const senhaNova = req.body.senhaNova; 

            const connection = connectionFactory();

            usuariosBanco.verificarSenha(id, connection, function(err, results) {
                if (err) {
                    connection.end();
                    return res.status(500).send("Erro ao verificar senha.");
                }

                if (results.length === 0) {
                    connection.end();
                    return res.render('autenticacao/meu-perfil', { 
                        erroSenha: 'Usuário não encontrado', 
                        erroNome: null, 
                        usuario: req.session.usuario, 
                        errosValidacao: {} 
                    });
                }

                const senhaEncontrada = results[0];
            

                if (!senhaValidada) {
                    connection.end();
                    return res.render('autenticacao/meu-perfil', { 
                        erroSenha: 'Senha atual está incorreta', 
                        erroNome: null, 
                        usuario: req.session.usuario, 
                        errosValidacao: {} 
                    });
                }

                const salt = bcrypt.genSaltSync(10);
                const senhaHash = bcrypt.hashSync(senhaNova, salt);

                const dados = { senhaNova: senhaHash, id: id };
                usuariosBanco.alterarSenha(dados, connection, function(err, results) {
                    connection.end();
                    if (err) {
                        return res.status(500).send("Erro ao atualizar senha no banco: " + err);
                    }
                    
                    res.redirect('/perfil');
                });
            });
        }
    ],

    logout: function(req, res) {
        req.session.destroy(function(err) {
            res.redirect('/login');
        });
    }
};