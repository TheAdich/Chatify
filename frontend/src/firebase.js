// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getStorage} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAxB7ikRMv5NnEoVF6jfDpjxvYmqoFuxFM",
  authDomain: "chatifyimages.firebaseapp.com",
  projectId: "chatifyimages",
  storageBucket: "chatifyimages.appspot.com",
  messagingSenderId: "281599328800",
  appId: "1:281599328800:web:b13a8b1d9becefd63ab245",
  measurementId: "G-1187XLTHDE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);