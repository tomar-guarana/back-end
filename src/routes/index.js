const express = require('express');
const request = require('request');
const upload = require('express-fileupload');
const router = express.Router();

router.use(upload());

var headersPost = function(ra, senha){
    return {
    'Content-type': 'application/json;charset=UTF-8',
    'idcampus': '2',
    'codigoaluno': ra,
    'senhaaluno': senha
    } 
};

function getGrupo(id, data){
    var send = {}, d = [], horas = 0;
    for(item in data){
        if(data[item].grupo == id){
            d.push(data[item]);
            horas += parseInt(data[item].horas);
        }
    }
    send.certificados = d;
    send.horas = horas;
    return send;
}

// url de index
router.get('/', function (req, res, next) {
    var data = [];
    var nomeAluno = req.session.nomeAluno;
    //res.send('Tela inicial');

    request({
        url: 'http://localhost:3000/api/certificado/1/' + nomeAluno.replace(/ /g,'-').toLowerCase(),
        method: 'GET'
        },
        function (err, resp, body) {
            if (!err && resp.statusCode == 200){
                data = JSON.parse(body);
                res.render('index', {
                    nome : nomeAluno,
                    grupo : {
                        '1' : getGrupo(1, data),
                        '2' : getGrupo(2, data), 
                        '3' : getGrupo(3, data) 
                    }
                });
            }
        });
});

// url de logout
router.get('/logout',function (req, res, next) {
    delete req.session.admin;
    delete req.session.authenticated;
    delete req.session.nomeAluno;
    res.redirect('/login');
});

// url de login GET
router.get('/login',function (req, res, next) {
    //res.send('Tela de login');
    res.render('login', {err : 0});
});
// url de login POST
router.post('/login', function (req, res, next){
    if(req.body.ra == 'admin' && req.body.senha == 'admin'){
        req.session.admin = true;
        req.session.authenticated = true;
        res.redirect('/painel-adm');
    }

    request({
        url: 'https://ws.utfapp.com/v2/auth/aluno',
        headers: headersPost(req.body.ra, req.body.senha),
        method: 'POST'
        },
        function (err, resp, body) {
            if(body.match(/error/)){
                res.render('login', {err : 1});
                return;
            }
            if (!err && resp.statusCode == 200){
                body = JSON.parse(body);
                auth = body.authAluno;

                request({
                    url: 'https://ws.utfapp.com/v2/aluno',
                    headers: {'auth-aluno' : auth},
                    method: 'GET'
                    },
                    function (e, r, b) {
                        if (!e && r.statusCode == 200){
                            b = JSON.parse(b);
                            req.session.authenticated = true;
                            req.session.admin = false;
                            req.session.nomeAluno = b.nomeAluno;
                            //res.send(b);
                            res.redirect('/');
                        }
                    }
                );
            }
        }
    );
    
});

// url painel administrativo GET
router.get('/painel-adm', function (req, res, next) {
    var data = [];

    request({
        url: 'http://localhost:3000/api/certificado/0/',
        headers: {},
        method: 'GET'
        },
        function (err, resp, body) {
            if (!err && resp.statusCode == 200){
                data = JSON.parse(body);
                //console.log(data[0]);
                res.render('painel-admin', {data: data});
            }
        });
});

router.post('/painel-adm', function (req, res, next) {
var data = [];

request({
    url: 'http://localhost:3000/api/certificado/update/'+req.body.id,
    method: 'POST',
    form: {
            grupo    : req.body.grupo,
            aprovado : (req.body.aprovado == 'on')?1:0,
            horas    : req.body.horas
        }
        },
        function (err, resp, body) {
            if (!err && resp.statusCode == 200){
                res.redirect('painel-adm');
            }
        });
});

// url incluir certificados GET
router.get('/incluir-certificado', function (req, res, next) {
    res.render('incluir-certificado');
});
// url incluir certificado POST
router.post('/incluir-certificado', function (req, res, next) {
    var file = req.files.arquivo;
    var tipo = req.body.tipo;
    var grupo = req.body.grupo;
    var nome = req.session.nomeAluno;
    var base = 'http://localhost:3000/view/';    

    //console.log(file);
    file.mv('./upload/'+file.name, function(err) {
        if (err)
          return res.status(500).send(err);
        
        request({
            url: 'http://localhost:3000/api/certificado/incluir',
            method: 'POST',
            form: {
                    'Certificado-href' : base + file.name,
                    Tipo: tipo,
                    aprovado: 0,
                    grupo: grupo,
                    horas: 0,
                    nome: nome.toUpperCase()
                }
                },
                function (err, resp, body) {
                    if (!err && resp.statusCode == 200){
                        res.redirect('incluir-certificado');                        
                    }
                });
    })    

});

module.exports = router;