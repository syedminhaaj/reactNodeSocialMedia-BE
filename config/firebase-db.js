const admin = require("firebase-admin");
const serviceAccount = require("./firebase-config");
const firebaseConfig = JSON.parse(process.env.firebaseConfig);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
