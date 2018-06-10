const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const index = require('./routes/index');
const api = require('./routes/api');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function checkAuth (req, res, next) {
    console.log('checkAuth ' + req.url + " " + req.session.authenticated);

    if(!req.url.match(/api/)){
        if(req.session.admin == true && req.url == '/login'){
            res.redirect('/painel-adm');
            return;
        }

        if ((!req.session || !req.session.authenticated) && req.url != '/login'){
            res.redirect('/login');
            return;
        }

        if (req.session && req.session.authenticated && req.url == '/login'){
            res.redirect('/');
            return;
        }
    }
	next();
}

app.set('view engine', 'ejs');
app.use(session({
    secret : 'certificados',
    resave: true,
    saveUninitialized: false
    }));
app.use(checkAuth);

//Rotas
app.use('/', index);
app.use('/api', api);

module.exports = app;