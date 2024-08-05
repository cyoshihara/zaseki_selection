// Firebaseの設定
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

// 座席の状態を管理するオブジェクト
const seatStatus = {};

// ユーザー名を表示
function displayUserName() {
  const userName = localStorage.getItem('userName');
  if (userName) {
      document.getElementById('userNameDisplay').textContent = userName;
  } else {
      window.location.href = 'index.html'; // ユーザー名が設定されていない場合、登録ページにリダイレクト
  }
}

// 座席の生成
function createSeats() {
  const bus = document.getElementById('bus');
  for (let row = 1; row <= 10; row++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'row';
      for (let seat of ['A', 'B', 'C', 'D']) {
          const seatDiv = document.createElement('div');
          seatDiv.className = 'seat';
          seatDiv.dataset.seat = `${row}${seat}`;
          seatDiv.textContent = `${row}${seat}`;
          seatDiv.addEventListener('click', () => toggleSeat(`${row}${seat}`));
          rowDiv.appendChild(seatDiv);
      }
      bus.appendChild(rowDiv);
  }
}

// 座席の選択/解除
function toggleSeat(seatId) {
  const userName = localStorage.getItem('userName');
  const currentStatus = seatStatus[seatId];
  let newStatus;

  if (currentStatus && currentStatus.userName === userName) {
      newStatus = null; // 自分の選択を解除
  } else if (!currentStatus) {
      newStatus = { userName: userName }; // 新しく選択
  } else {
      alert('この座席は既に選択されています。');
      return;
  }
  
  // Firebaseのデータを更新
  database.ref('seats/' + seatId).set(newStatus);
}

// Firebaseからのデータ変更を監視
function listenToSeatChanges() {
  database.ref('seats').on('value', (snapshot) => {
      const seats = snapshot.val();
      for (let seatId in seats) {
          updateSeatUI(seatId, seats[seatId]);
      }
  });
}

// UIの更新
function updateSeatUI(seatId, status) {
  const seatElement = document.querySelector(`.seat[data-seat="${seatId}"]`);
  seatStatus[seatId] = status;
  
  if (status) {
      seatElement.classList.add('selected');
      seatElement.title = `選択者: ${status.userName}`;
      if (status.userName === localStorage.getItem('userName')) {
          seatElement.classList.add('own-selection');
      } else {
          seatElement.classList.remove('own-selection');
      }
  } else {
      seatElement.classList.remove('selected', 'own-selection');
      seatElement.title = '';
  }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  displayUserName();
  createSeats();
  listenToSeatChanges();
});