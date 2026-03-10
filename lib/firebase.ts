import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCpVHMPT32ci8OdF8duSZ5FsioLCJXZAyA", 
    databaseURL: "https://airquality-iot-d59de-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);