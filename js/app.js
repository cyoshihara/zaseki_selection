// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDTGAqHzo_aDPMLw07rhuxFf3XsESkKizw",
  authDomain: "zaseki-selection.firebaseapp.com",
  databaseURL: "https://zaseki-selection-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zaseki-selection",
  storageBucket: "zaseki-selection.appspot.com",
  messagingSenderId: "856825978521",
  appId: "1:856825978521:web:236077a10a22b4cd26a208",
  measurementId: "G-L0MLC8DV70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firebaseの初期化
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// バスレイアウトの生成
function generateBusLayout() {
  const busLayout = document.getElementById('busLayout');
  for (let i = 1; i <= 40; i++) {
      const seat = document.createElement('div');
      seat.className = 'seat';
      seat.id = `seat-${i}`;
      seat.textContent = i;
      seat.onclick = () => selectSeat(i);
      busLayout.appendChild(seat);
  }
}

// 座席選択の処理
function selectSeat(seatNumber) {
  const user = document.getElementById('userSelect').value;
  if (!user) {
      alert('先に名前を選択してください');
      return;
  }
  
  database.ref('seats').once('value', (snapshot) => {
      const seats = snapshot.val() || {};
      const userCurrentSeat = Object.keys(seats).find(key => seats[key] === user);
      
      if (userCurrentSeat) {
          alert('すでに座席を選択しています');
          return;
      }
      
      if (seats[seatNumber]) {
          alert('この座席は既に選択されています');
      } else {
          database.ref(`seats/${seatNumber}`).set(user);
      }
  });
}

// 座席表示の更新
database.ref('seats').on('value', (snapshot) => {
  const seats = snapshot.val() || {};
  Object.keys(seats).forEach((seatNumber) => {
      const user = seats[seatNumber];
      const seatElement = document.getElementById(`seat-${seatNumber}`);
      seatElement.textContent = `${seatNumber}: ${user}`;
      seatElement.classList.add('occupied');
  });
});

// アプリの初期化
generateBusLayout();