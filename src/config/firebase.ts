import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// In a production app, these would be stored in environment variables
const firebaseConfig = {
  apiKey: "AIzaSyDbNh4C7T3AQLBr9GGJgS0MvJ6DNw52KMg",
  authDomain: "starzapp.firebaseapp.com",
  databaseURL: "https://starzapp-default-rtdb.firebaseio.com",
  projectId: "starzapp",
  storageBucket: "starzapp.appspot.com",
  messagingSenderId: "655518493333",
  appId: "1:655518493333:web:1dc7c6c70f8a8cd8c7c99c",
  measurementId: "G-5PQ31T0NCJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };
export default app;