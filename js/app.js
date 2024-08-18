// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getDatabase, ref, get, set, onValue, remove, push } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
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

// ユーザー追加の処理
function addUser(userName) {
  const usersRef = ref(database, 'users');
  push(usersRef, userName).then(() => {
    console.log('ユーザーが追加されました');
    generateUserSelect(); // ドロップダウンを更新
  }).catch((error) => {
    console.error("ユーザー追加エラー:", error);
  });
}

// ユーザー削除の処理
function deleteUser(userName) {
  const usersRef = ref(database, 'users');
  get(usersRef).then((snapshot) => {
    const users = snapshot.val();
    const userKey = Object.keys(users).find(key => users[key] === userName);
    if (userKey) {
      remove(ref(database, `users/${userKey}`)).then(() => {
        console.log('ユーザーが削除されました');
        generateUserSelect(); // ドロップダウンを更新
      }).catch((error) => {
        console.error("ユーザー削除エラー:", error);
      });
    } else {
      console.log('ユーザーが見つかりません');
    }
  }).catch((error) => {
    console.error("ユーザー取得エラー:", error);
  });
}

// ユーザ選択のドロップダウン作成
function generateUserSelect() {
  const userSelect = document.getElementById('userSelect');
  const usersRef = ref(database, 'users');
  
  get(usersRef).then((snapshot) => {
    if (snapshot.exists()) {
      const users = snapshot.val();
      userSelect.innerHTML = '<option value="">ユーザーを選択してください</option>';
      for (const [key, name] of Object.entries(users)) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        userSelect.appendChild(option);
      }
      generateDeleteUserSelect(users); // 削除用ドロップダウンも更新
    } else {
      console.log("ユーザーデータがありません");
    }
  }).catch((error) => {
    console.error("ユーザーデータの取得エラー:", error);
  });
}

// 削除用ユーザー選択ドロップダウンの生成
function generateDeleteUserSelect(users) {
  const deleteUserSelect = document.getElementById('deleteUserSelect');
  deleteUserSelect.innerHTML = '<option value="">削除するユーザーを選択</option>';
  for (const [key, name] of Object.entries(users)) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    deleteUserSelect.appendChild(option);
  }
}

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
  for (let i = 1; i <= 44; i++) {
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
  for (let i = 1; i <= 44; i++) {
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


function addEventListeners() {
  // ユーザー追加フォームのイベントリスナー
  document.getElementById('addUserForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const newUserName = document.getElementById('newUserName').value;
    if (newUserName) {
      addUser(newUserName);
      document.getElementById('newUserName').value = ''; // フォームをクリア
    } else {
      alert('ユーザー名を入力してください');
    }
  });

  // ユーザー削除フォームのイベントリスナー
  document.getElementById('deleteUserForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const deleteUserName = document.getElementById('deleteUserSelect').value;
    if (deleteUserName) {
      // 確認ダイアログを表示
      const confirmDelete = confirm(`本当に「${deleteUserName}」を削除しますか？`);
      if (confirmDelete) {
        deleteUser(deleteUserName);
      }
      else {
        console.log('削除がキャンセルされました');
      }

      // deleteUser(deleteUserName);
      // document.getElementById('deleteUserSelect').value = ''; // フォームをクリア
    } else {
      alert('削除するユーザー名を入力してください');
    }
  });
}

// アプリの初期化
function initializePage() {
  addEventListeners();
  generateUserSelect();  
  generateBusLayout();
}

initializePage();
