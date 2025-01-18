const admin = require("firebase-admin");
const serviceAccount = require("./firebase-config.js");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
