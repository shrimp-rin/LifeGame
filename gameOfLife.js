const canvas = document.getElementById('gameOfLifeCanvas');
const ctx = canvas.getContext('2d');
const resolution = 10; // セルのサイズ
let cols; // カラム数
let rows; // ロウ数

let grid;
let stateHistory = [];
const maxHistorySize = 10;
const restartAfter = 10;
let lastRestart = Date.now();

window.addEventListener('resize', resizeCanvas, false);
resizeCanvas(); // 初期ロード時にキャンバスをリサイズ

canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;    // キャンバスの実際の幅と表示幅の比率
    const scaleY = canvas.height / rect.height;  // キャンバスの実際の高さと表示高さの比率

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const col = Math.floor(x / resolution);
    const row = Math.floor(y / resolution);

    // タップまたはクリックされた位置とその周囲に生命を生成
    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            if (i === 0 && j === 0) {
                // 中心点
                grid[col][row] = 1;
            } else if (Math.random() < 0.5) {
                // 周囲のセルにランダムに生命を配置
                const newCol = (col + i + cols) % cols;
                const newRow = (row + j + rows) % rows;
                grid[newCol][newRow] = 1;
            }
        }
    }
});

const restartButton = document.getElementById('restartButton');
if (restartButton) {
  restartButton.addEventListener('click', () => {
    grid = newGrid(); // グリッドをリスタート
    stateHistory.length = 0; // 状態履歴をリセット
    lastRestart = Date.now(); // リスタート時間を更新
  });
}

function resizeCanvas() {
    canvas.width = window.innerWidth - 25;
    canvas.height = window.innerHeight - 25;
    cols = Math.floor(canvas.width / resolution);
    rows = Math.floor(canvas.height / resolution);
    grid = newGrid();
    stateHistory = [];
  }

function newGrid() {
  return new Array(cols).fill(null)
    .map(() => new Array(rows).fill(null)
      .map(() => Math.floor(Math.random() * 2)));
}

function drawGrid() {
  for (let col = 0; col < grid.length; col++) {
    for (let row = 0; row < grid[col].length; row++) {
      const cell = grid[col][row];
      ctx.beginPath();
      ctx.rect(col * resolution, row * resolution, resolution, resolution);
      ctx.fillStyle = cell ? 'black' : 'white';
      ctx.fill();
      ctx.stroke();
    }
  }
}

function updateGrid() {
  grid = grid.map((col, i) => col.map((cell, j) => {
    const neighbors = [
      grid[i][j - 1], grid[i][j + 1],
      grid[(i - 1 + cols) % cols][j], grid[(i + 1) % cols][j],
      grid[(i - 1 + cols) % cols][j - 1], grid[(i + 1) % cols][j - 1],
      grid[(i - 1 + cols) % cols][j + 1], grid[(i + 1) % cols][j + 1],
    ].filter(Boolean).length;
    return neighbors === 3 || (cell && neighbors === 2) ? 1 : 0;
  }));
}

function update() {
    drawGrid();
    updateGrid();
    
    // 現在のグリッドの状態を文字列に変換
    const currentState = grid.flat().join('');
    
    // 状態が過去に存在するか確認
    if (stateHistory.includes(currentState)) {
      // 現在の時刻が最後にリスタートしてから restartAfter 秒以上経過しているか
      if ((Date.now() - lastRestart) / 1000 > restartAfter) {
        grid = newGrid(); // グリッドをリスタート
        stateHistory.length = 0; // 状態履歴をリセット
        lastRestart = Date.now(); // リスタート時間を更新
      }
    } else {
      // 状態履歴に現在の状態を追加
      stateHistory.push(currentState);
      // 履歴が最大サイズを超えた場合、古い状態を削除
      if (stateHistory.length > maxHistorySize) {
        stateHistory.shift();
      }
    }
  
    requestAnimationFrame(update);
  }

update();

function handleCanvasEvent(event) {
    event.preventDefault(); // デフォルトのタッチ操作（スクロールなど）をキャンセル
    let clientX, clientY;
    if (event.type === 'click') {
        clientX = event.clientX;
        clientY = event.clientY;
    } else if (event.type === 'touchstart') {
        clientX = event.touches[0].clientX; // タッチイベントの座標を取得
        clientY = event.touches[0].clientY;
    }

    // 以下の座標変換処理と生命を生成する処理は変更なし
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;    
    const scaleY = canvas.height / rect.height;  

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const col = Math.floor(x / resolution);
    const row = Math.floor(y / resolution);

    // タップまたはクリックされた位置とその周囲に生命を生成
    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            if (i === 0 && j === 0) {
                grid[col][row] = 1;
            } else if (Math.random() < 0.5) {
                const newCol = (col + i + cols) % cols;
                const newRow = (row + j + rows) % rows;
                grid[newCol][newRow] = 1;
            }
        }
    }
}

// イベントリスナーを追加する部分
canvas.addEventListener('click', handleCanvasEvent);
canvas.addEventListener('touchend', handleCanvasEvent);