const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

var headersPost = function(ra, senha){
    return {
    'Content-type': 'application/json;charset=UTF-8',
    'idcampus': '2',
    'codigoaluno': ra,
    'senhaaluno': senha
    } 
};

// url de index
router.get('/', function (req, res, next) {
    var data = [];
    var nomeAluno = req.session.nomeAluno;
    //res.send('Tela inicial');

    request({
        url: 'http://localhost:3000/api/certificado/1/' + nomeAluno.replace(/ /g,'-').toLowerCase(),
        headers: headersPost(req.body.ra, req.body.senha),
        method: 'GET'
        },
        function (err, resp, body) {
            if (!err && resp.statusCode == 200){
                data = JSON.parse(body);
            }
        });

    res.render('index', {nome : nomeAluno, data : data});
});

// url de logout
router.get('/logout',function (req, res, next) {
    delete req.session.authenticated ;
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

// url incluir certificados GET
router.get('/incluir-certificado', function (req, res, next) {
    
});
// url incluir certificado POST
router.post('/incluir-certificado', function (req, res, next) {
    
});

module.exports = router;