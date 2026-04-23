import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCOsBkkr8Lt07-FigOg8rateJhkhvE1EcI',
  authDomain: 'atvd6-prog3.firebaseapp.com',
  projectId: 'atvd6-prog3',
  storageBucket: 'atvd6-prog3.appspot.com',
  messagingSenderId: '907625965511',
  appId: '1:907625965511:web:d895a01a7250296d215be2',
  measurementId: 'G-V2LSCST16H',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
