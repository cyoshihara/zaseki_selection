// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getDatabase, ref, get, set, onValue, remove } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
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

// 現在のユーザーの座席
let currentUserSeat = null;

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

    if (userCurrentSeat && userCurrentSeat === String(seatNumber)) {
      // 自分の座席をもう一度クリックした場合、クリアする
      remove(ref(database, `seats/${seatNumber}`));
      currentUserSeat = null;
    } else if (userCurrentSeat && userCurrentSeat !== String(seatNumber)) {
      // 自分の座席を変更する場合
      remove(ref(database, `seats/${userCurrentSeat}`));
      set(ref(database, `seats/${seatNumber}`), user);
      currentUserSeat = seatNumber;
    } else if (!seats[seatNumber]) {
      // 新しく座席を選択する場合
      set(ref(database, `seats/${seatNumber}`), user);
      currentUserSeat = seatNumber;
    } else {
      alert('この座席は既に選択されています');
    }
  });
}

// 座席表示の更新
const seatsRef = ref(database, 'seats');
onValue(seatsRef, (snapshot) => {
  const seats = snapshot.val() || {};
  for (let i = 1; i <= 40; i++) {
    const seatElement = document.getElementById(`seat-${i}`);
    if (seats[i]) {
      seatElement.textContent = `${i}: ${seats[i]}`;
      seatElement.classList.add('occupied');
      if (seats[i] === document.getElementById('userSelect').value) {
        currentUserSeat = i;
      }
    } else {
      seatElement.textContent = i;
      seatElement.classList.remove('occupied');
    }
  }
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