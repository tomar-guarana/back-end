const express = require('express');
const firebase = require('../firebase-admin');
const router = express.Router();

function getFromNome(id, db, nm = null) {
  var arrayNome = [];
  if(nm && nm != null){
    nm = nm.replace(/-/g,' ').toUpperCase();
  }

  for(item in db['certificado']){
      //if(db['certificado'][item].aprovado == id){
        if(nm && db['certificado'][item].nome === nm){
          db['certificado'][item].id = item
          arrayNome.push(db['certificado'][item]);
        }else if(nm == null){
          db['certificado'][item].id = item
          arrayNome.push(db['certificado'][item]);
        }
      //}
  }

  return arrayNome;
}

router.get('/certificado/:id', function (req, res, next) {
    var id = req.params.id;
    
    firebase.once('value', function(snapshot) {
        var data = snapshot.val();
        var dataMod = getFromNome(id, data);
        res.send(dataMod);
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
});

router.get('/certificado/:id/:nome', function (req, res, next) {
    var nome = req.params.nome;
    var id = req.params.id;
    
    firebase.once('value', function(snapshot) {
        var data = snapshot.val();
        var dataMod = getFromNome(id, data, nome);
        res.send(dataMod);
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
});

router.post('/certificado/update/:id', function (req, res, next) {
  var id = req.params.id;
  console.log(req.body);
  firebase.child('certificado/'+id).update(
    req.body
  );
  res.status(200).send('OK');
});

router.all('*', function (req, res, next) {
    res.redirect('/');
});

module.exports = router;