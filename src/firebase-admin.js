var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gerenciador-certificados.firebaseio.com"
});

module.exports = {
  database : admin.database().ref("/")
}