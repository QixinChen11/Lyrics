import React, { Component } from 'react';
import firebase from "firebase";
import SearchBox from './components/Ui';
import * as admin from "firebase-admin";


const config = {
  apiKey: "AIzaSyDCwVwk0336x45bP9RN70VzAuLFyHpWJcM",
  authDomain: "hackathon-a2826.firebaseapp.com",
  databaseURL: "https://hackathon-a2826.firebaseio.com",
  projectId: "hackathon-a2826",
  storageBucket: "hackathon-a2826.appspot.com",
  messagingSenderId: "859062463142"
};

firebase.initializeApp(config);

const settings = {timestampsInSnapshots: true};
const firestoreDb = firebase.firestore();
firestoreDb.settings(settings);

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

let db = admin.firestore();

class App extends Component {

  render() {
    return (
      <div className="App">             
          <SearchBox database = {firestoreDb}/>
      </div>
    );
  }
}

export default App;
