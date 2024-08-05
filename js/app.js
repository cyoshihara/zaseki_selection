// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getDatabase, ref, get, set, onValue } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
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

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 座席選択の処理
function selectSeat(seatNumber) {
  const user = document.getElementById('userSelect').value;
  if (!user) {
    alert('先に名前を選択してください');
    return;
  }
  
  const seatRef = ref(database, 'seats');
  get(seatRef).then((snapshot) => {
    const seats = snapshot.val() || {};
    const userCurrentSeat = Object.keys(seats).find(key => seats[key] === user);
    
    if (userCurrentSeat) {
      alert('すでに座席を選択しています');
      return;
    }
    
    if (seats[seatNumber]) {
      alert('この座席は既に選択されています');
    } else {
      set(ref(database, `seats/${seatNumber}`), user);
    }
  });
}

// 座席表示の更新
const seatsRef = ref(database, 'seats');
onValue(seatsRef, (snapshot) => {
  const seats = snapshot.val() || {};
  Object.keys(seats).forEach((seatNumber) => {
    const user = seats[seatNumber];
    const seatElement = document.getElementById(`seat-${seatNumber}`);
    seatElement.textContent = `${seatNumber}: ${user}`;
    seatElement.classList.add('occupied');
  });
});

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

// アプリの初期化
generateBusLayout();