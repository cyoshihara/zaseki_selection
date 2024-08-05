// Firebaseの設定（自分のプロジェクトの設定に置き換えてください）
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

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