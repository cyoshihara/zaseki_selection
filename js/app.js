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
  const seatsRef = ref(database, 'seats');
  get(seatsRef).then((snapshot) => {
    const seats = snapshot.val() || {};
    const userCurrentSeat = Object.keys(seats).find(key => seats[key] === user);

    // 他のユーザーが選択している座席かチェック
    if (seats[seatNumber] && seats[seatNumber] !== user) {
      alert('この座席は既に他のユーザーによって選択されています');
      return;
    }

    if (userCurrentSeat === String(seatNumber)) {
      // 自分の座席をもう一度クリックした場合、クリアする
      remove(ref(database, `seats/${seatNumber}`));
    } else {
      // 新しい座席を選択する場合
      if (userCurrentSeat) {
        // 既存の座席を解除
        remove(ref(database, `seats/${userCurrentSeat}`));
      }
      // 新しい座席を設定
      set(ref(database, `seats/${seatNumber}`), user);
    }
  }).catch((error) => {
    console.error("Error selecting seat: ", error);
    alert('座席の選択中にエラーが発生しました');
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

    // 通路を表現するためのスペースを追加
    if (i % 2 === 0 && i % 4 != 0) { // 例えば4席ごとに通路を入れる
      const aisle = document.createElement('div');
      aisle.className = 'aisle';
      busLayout.appendChild(aisle);
    }    
  }
}

// アプリの初期化
generateBusLayout();