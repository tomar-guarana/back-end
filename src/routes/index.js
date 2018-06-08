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
    res.send('Tela inicial');
});

// url de logout
router.get('/logout',function (req, res, next) {
    delete req.session.authenticated ;
    res.redirect('/login');
});

// url de login GET
router.get('/login',function (req, res, next) {
    res.send('Tela de login');
});
// url de login POST
router.post('/login', function (req, res, next){
    request({
        url: 'https://ws.utfapp.com/v2/auth/aluno',
        headers: headersPost(req.body.ra, req.body.senha),
        method: 'POST'
        },
        function (err, resp, body) {
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
                            req.session.nome = b.nomeAluno;

                            res.send(b);
                            //res.render('../view/index',{nome : b.nomeAluno});
                        }
                    }
                );
            }
        }
    );
    
});

module.exports = router;