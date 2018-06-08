var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gerenciador-certificados.firebaseio.com"
});

var db = admin.database();
module.exports = db.ref("/");

// ref.once("value", function(snapshot) {
//   console.log(snapshot.val());
// }, function (errorObject) {
//     console.log("The read failed: " + errorObject.code);
// });
