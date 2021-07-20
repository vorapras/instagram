import firebase from 'firebase';
require('firebase/firestore')

const config = {
    apiKey: "AIzaSyAvCHuuBukBPNhG-7p7Z-oTJ5ShqWJCtsE",
    authDomain: "instragram-82e33.firebaseapp.com",
    databaseURL: "https://instragram-82e33.firebaseio.com",
    projectId: "instragram-82e33",
    storageBucket: "instragram-82e33.appspot.com",
    messagingSenderId: "301415633065",
    appId: "1:301415633065:web:f0ca62bf384e595f13d9b8",
    measurementId: "G-V0MGV9QF2L"
}

firebase.initializeApp(config)

const db = firebase.firestore()

//Need to add this to forgo deprecated warnings
// db.settings({
//   timestampsInSnapshots: true
// });

export default db;