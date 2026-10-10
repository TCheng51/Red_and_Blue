// Game Constants
const CELL_EMPTY = 0;
const CELL_RED = 1;
const CELL_BLUE = 2;

// Backtracking attempts before giving up on puzzle generation.
const MAX_ATTEMPTS = 1000;
let generationAttemptLog = [];

function storageAvailable() {
  try {
    const storage = typeof window !== 'undefined' ? window.localStorage : null;
    if (!storage) return false;
    const key = '__puzzle_storage_test__';
    storage.setItem(key, '1');
    storage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}

const gameState = {
  size: 6,
  difficulty: 'medium',
  grid: [],
  initialGrid: [],
  violations: {
    rows: Array(6).fill(false),
    cols: Array(6).fill(false),
    cells: Array(6).fill(0).map(() => Array(6).fill(false)),
  },
  hasViolations: false,
  isSolved: false,
  currentLanguage: 'zh-tw',
  startTime: null,
  elapsedTime: 0,
  moveHistory: [],
  stats: { gamesPlayed: 0, gamesWon: 0, bestTime: null },
  selectedCell: null,
  timerInterval: null,
  feedbackTimeout: null,
  storageAvailable: storageAvailable(),
};

const translations = {
  en: {
    settings: '⚙️ Settings',
    language: 'Language',
    appTitle: 'Red and Blue',
    title: 'Binary Puzzle - Red and Blue',
    size: 'Size:',
    difficulty: 'Difficulty:',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    newGame: 'New Game',
    reset: 'Reset',
    undo: 'Undo',
    hint: 'Hint',
    hintTripletRow: 'Row {row}: three-in-a-row of {color} at {range}',
    hintTripletCol: 'Column {col}: three-in-a-column of {color} at {range}',
    hintCountRow: 'Row {row}: red and blue counts are not equal',
    hintCountCol: 'Column {col}: red and blue counts are not equal',
    hintUniqRow: 'Row {row} is identical to row {otherRow}',
    hintUniqCol: 'Column {col} is identical to column {otherCol}',
    resetStats: 'Reset stats',
    storageUnavailable: 'Stats are stored in memory only while localStorage is blocked.',
    gamesPlayed: 'Games Played:',
    gamesWon: 'Games Won:',
    bestTime: 'Best Time:',
    solvedMessage: 'Congratulations! You solved the puzzle! 🎉',
    solvedMessageWithTime: 'Congratulations! You solved the puzzle in {time} seconds! 🎉',
    violationMessage: 'There are violations in the grid. Keep going!',
    puzzleGenerationError: 'Puzzle generation failed. Please try a fresh board.',
    howToPlayTitle: 'How to Play Binary Puzzle:',
    instructions: 'Click on a cell or use arrow keys to select, then click/press number to fill (1=Red, 2=Blue, 0=Empty). Locked cells have a gray background. Highlighted areas indicate rule violations.',
    rules: [
      'Fill each empty cell with a red or blue circle.',
      'Any row or column must not have <strong>more than two adjacent circles of the same color</strong>.',
      'Each row and column must contain the same number of red and blue circles <strong>only when fully filled</strong> and only for even-sized grids.',
      'All rows must be <strong>unique</strong>; no two rows can share the same circle pattern.',
      'All columns must be <strong>unique</strong>; no two columns can share the same circle pattern.'
    ],
  },
  'zh-tw': {
    settings: '⚙️ 設定',
    language: '語言',
    appTitle: 'Red and Blue',
    title: 'Binary Puzzle - Red and Blue',
    size: '大小：',
    difficulty: '難度：',
    easy: '簡單',
    medium: '中等',
    hard: '困難',
    newGame: '新遊戲',
    reset: '重置',
    undo: '復原',
    hint: '提示',
    hintTripletRow: '第 {row} 行：{color} 在 {range} 三連',
    hintTripletCol: '第 {col} 列：{color} 在 {range} 三連',
    hintCountRow: '第 {row} 行：紅藍數量不相等',
    hintCountCol: '第 {col} 列：紅藍數量不相等',
    hintUniqRow: '第 {row} 行與第 {otherRow} 行完全相同',
    hintUniqCol: '第 {col} 列與第 {otherCol} 列完全相同',
    resetStats: '重設統計',
    storageUnavailable: '目前瀏覽器無法使用 localStorage，統計資料只保存在記憶體中。',
    gamesPlayed: '遊戲次數：',
    gamesWon: '勝利次數：',
    bestTime: '最佳時間：',
    solvedMessage: '恭喜！您解決了拼圖！🎉',
    solvedMessageWithTime: '恭喜！您用 {time} 秒解決了拼圖！🎉',
    violationMessage: '網格中存在違規。請繼續！',
    puzzleGenerationError: '拼圖生成失敗，請再試一次新局。',
    howToPlayTitle: '二進制拼圖玩法說明：',
    instructions: '點擊格子或使用方向鍵選擇，然後點擊/按數字填入（1=紅色、2=藍色、0=空白）。灰色背景的方塊是初始拼圖，無法更改。高亮區域表示規則違規。',
    rules: [
      '將每個空格填入紅色或藍色圓圈。',
      '任何行或列中，<strong>不能有超過兩個相同顏色的相鄰圓圈</strong>。',
      '每個行和每個列必須包含<strong>相同數量的紅色和藍色圓圈</strong>（此規則僅適用於偶數大小的網格，且僅當該行/列完全填滿時）。',
      '所有行必須是<strong>唯一</strong>的。沒有兩行可以有完全相同的圓圈模式。',
      '所有列必須是<strong>唯一</strong>的。沒有兩列可以有完全相同的圓圈模式。'
    ],
  },
  'zh-cn': {
    settings: '⚙️ 设置',
    language: '语言',
    appTitle: 'Red and Blue',
    title: 'Binary Puzzle - Red and Blue',
    size: '大小：',
    difficulty: '难度：',
    easy: '简单',
    medium: '中等',
    hard: '困难',
    newGame: '新游戏',
    reset: '重置',
    undo: '撤销',
    hint: '提示',
    hintTripletRow: '第 {row} 行：{color} 在 {range} 三连',
    hintTripletCol: '第 {col} 列：{color} 在 {range} 三连',
    hintCountRow: '第 {row} 行：红蓝数量不相等',
    hintCountCol: '第 {col} 列：红蓝数量不相等',
    hintUniqRow: '第 {row} 行与第 {otherRow} 行完全相同',
    hintUniqCol: '第 {col} 列与第 {otherCol} 列完全相同',
    resetStats: '重设统计',
    storageUnavailable: '当前浏览器无法使用 localStorage，统计数据只保存在内存中。',
    gamesPlayed: '游戏次数：',
    gamesWon: '胜利次数：',
    bestTime: '最佳时间：',
    solvedMessage: '恭喜！您解决了拼图！🎉',
    solvedMessageWithTime: '恭喜！您用 {time} 秒解决了拼图！🎉',
    violationMessage: '网格中存在违规。请继续！',
    puzzleGenerationError: '拼图生成失败，请再试一次新局。',
    howToPlayTitle: '二进制拼图玩法说明：',
    instructions: '点击格子或使用方向键选择，然后点击/按数字填入（1=红色、2=蓝色、0=空白）。灰色背景的方块是初始拼图，无法更改。高亮区域表示规则违规。',
    rules: [
      '将每个空格填入红色或蓝色圆圈。',
      '任何行或列中，<strong>不能有超过两个相同颜色的相邻圆圈</strong>。',
      '每个行和每列必须包含<strong>相同数量的红色和蓝色圆圈</strong>（此规则仅适用于偶数大小的网格，且仅当该行/列完全填满时）。',
      '所有行必须是<strong>唯一</strong>的。没有两行可以有完全相同的圆圈模式。',
      '所有列必须是<strong>唯一</strong>的。没有两列可以有完全相同的圆圈模式。'
    ],
  },
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTime(ms) {
  return Math.floor(ms / 1000);
}

function loadStats() {
  if (!gameState.storageAvailable) {
    return {
      gamesPlayed: gameState.stats?.gamesPlayed || 0,
      gamesWon: gameState.stats?.gamesWon || 0,
      bestTime: gameState.stats?.bestTime || null,
    };
  }

  try {
    const saved = window.localStorage.getItem('puzzleStats');
    return saved ? JSON.parse(saved) : { gamesPlayed: 0, gamesWon: 0, bestTime: null };
  } catch (error) {
    console.error('Failed to load stats:', error);
    return { gamesPlayed: 0, gamesWon: 0, bestTime: null };
  }
}

function saveStats(stats) {
  if (!gameState.storageAvailable) {
    gameState.stats = stats;
    return;
  }

  try {
    window.localStorage.setItem('puzzleStats', JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save stats:', error);
  }
}

function startTimer() {
  // Always clear any pending timer/feedback before starting fresh.
  stopTimer();
  if (gameState.feedbackTimeout) {
    clearTimeout(gameState.feedbackTimeout);
    gameState.feedbackTimeout = null;
  }

  gameState.timerInterval = setInterval(() => {
    const elapsed = Date.now() - gameState.startTime;
    const timerEl = document.getElementById('timer');
    if (timerEl) {
      timerEl.textContent = `${Math.floor(elapsed / 1000)}s`;
    }
  }, 1000);
}

function stopTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
}

function initGameState() {
  gameState.violations = {
    rows: Array(gameState.size).fill(false),
    cols: Array(gameState.size).fill(false),
    cells: Array(gameState.size).fill(0).map(() => Array(gameState.size).fill(false)),
  };
  gameState.moveHistory = [];
  gameState.selectedCell = null;
  gameState.hasViolations = false;
  gameState.isSolved = false;
}

function getRowBalance(row) {
  const red = row.filter((v) => v === CELL_RED).length;
  const blue = row.filter((v) => v === CELL_BLUE).length;
  return { red, blue };
}

function getColumn(grid, c) {
  return grid.map((row) => row[c]);
}

function checkViolations(grid, size) {
  const violations = {
    rows: Array(size).fill(false),
    cols: Array(size).fill(false),
    cells: Array(size).fill(0).map(() => Array(size).fill(false)),
    reasons: [],
  };

  let hasViolations = false;
  const target = size / 2;

  const flagTriplet = (r, c, direction) => {
    violations.cells[r][c] = true;
    violations.cells[r][c - 1] = true;
    violations.cells[r][c - 2] = true;
    hasViolations = true;
    const color = grid[r][c] === CELL_RED ? 'red' : 'blue';
    violations.reasons.push({
      type: 'triplet',
      row: r,
      col: c,
      direction,
      color,
      start: c - 2,
      end: c,
    });
  };

  for (let r = 0; r < size; r++) {
    const row = grid[r];
    for (let c = 0; c < size; c++) {
      const value = row[c];
      if (c >= 2 && value !== CELL_EMPTY && value === row[c - 1] && value === row[c - 2]) {
        violations.rows[r] = true;
        flagTriplet(r, c, 'row');
      }

      if (r >= 2 && value !== CELL_EMPTY && value === grid[r - 1][c] && value === grid[r - 2][c]) {
        violations.cells[r][c] = true;
        violations.cells[r - 1][c] = true;
        violations.cells[r - 2][c] = true;
        violations.cols[c] = true;
        hasViolations = true;
        const color = grid[r][c] === CELL_RED ? 'red' : 'blue';
        violations.reasons.push({
          type: 'triplet',
          row: r,
          col: c,
          direction: 'column',
          color,
          start: r - 2,
          end: r,
        });
      }
    }

    const rowFull = row.every((cell) => cell !== CELL_EMPTY);
    if (rowFull) {
      const { red, blue } = getRowBalance(row);
      if (red !== target || blue !== target) {
        violations.rows[r] = true;
        hasViolations = true;
        violations.reasons.push({ type: 'count', row: r });
      }
      const rowKey = row.join('');
      for (let other = 0; other < r; other++) {
        if (grid[other].join('') === rowKey) {
          violations.rows[r] = true;
          violations.rows[other] = true;
          hasViolations = true;
          violations.reasons.push({ type: 'uniqueness', row: r, otherRow: other });
        }
      }
    }
  }

  for (let c = 0; c < size; c++) {
    const col = getColumn(grid, c);
    const colFull = col.every((cell) => cell !== CELL_EMPTY);
    if (colFull) {
      const red = col.filter((value) => value === CELL_RED).length;
      const blue = col.filter((value) => value === CELL_BLUE).length;
      if (red !== target || blue !== target) {
        violations.cols[c] = true;
        hasViolations = true;
        violations.reasons.push({ type: 'count', col: c });
      }
      const colKey = col.join('');
      for (let other = 0; other < c; other++) {
        if (getColumn(grid, other).join('') === colKey) {
          violations.cols[c] = true;
          violations.cols[other] = true;
          hasViolations = true;
          violations.reasons.push({ type: 'uniqueness', col: c, otherCol: other });
        }
      }
    }
  }

  return { violations, hasViolations };
}

function generateCompleteGrid(size) {
  const board = Array(size).fill(0).map(() => Array(size).fill(CELL_EMPTY));
  const target = size / 2;

  function isValidPlacement(r, c, value) {
    if (c >= 2 && value !== CELL_EMPTY && value === board[r][c - 1] && value === board[r][c - 2]) return false;
    if (r >= 2 && value !== CELL_EMPTY && value === board[r - 1][c] && value === board[r - 2][c]) return false;

    const row = board[r];
    const col = board.map((rowValues) => rowValues[c]);
    const rowFilled = row.every((cell) => cell !== CELL_EMPTY);
    const colFilled = col.every((cell) => cell !== CELL_EMPTY);

    if (rowFilled) {
      const red = row.filter((cell) => cell === CELL_RED).length;
      const blue = row.filter((cell) => cell === CELL_BLUE).length;
      if (red !== target || blue !== target) return false;
      for (let otherR = 0; otherR < r; otherR++) {
        if (board[otherR].join('') === row.join('')) return false;
      }
    }

    if (colFilled) {
      const red = col.filter((cell) => cell === CELL_RED).length;
      const blue = col.filter((cell) => cell === CELL_BLUE).length;
      if (red !== target || blue !== target) return false;
      for (let otherC = 0; otherC < c; otherC++) {
        const otherCol = board.map((rowValues) => rowValues[otherC]);
        if (otherCol.join('') === col.join('')) return false;
      }
    }

    return true;
  }

  function fill(r, c) {
    if (r === size) return true;
    const nextR = c === size - 1 ? r + 1 : r;
    const nextC = c === size - 1 ? 0 : c + 1;

    const values = [CELL_RED, CELL_BLUE];
    if (Math.random() < 0.5) values.reverse();

    for (const value of values) {
      board[r][c] = value;
      if (isValidPlacement(r, c, value) && fill(nextR, nextC)) {
        return true;
      }
      board[r][c] = CELL_EMPTY;
    }

    return false;
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        board[r][c] = CELL_EMPTY;
      }
    }

    if (fill(0, 0)) {
      generationAttemptLog = [];
      return board.map((row) => row.slice());
    }
  }

  console.warn(`generateCompleteGrid failed after ${MAX_ATTEMPTS} attempts for size ${size}`);
  generationAttemptLog.push(`failed size ${size} after ${MAX_ATTEMPTS} attempts`);
  return null;
}

function generatePuzzle() {
  // Clear any active timer/feedback so repeated generation never leaks callbacks.
  stopTimer();
  if (gameState.feedbackTimeout) {
    clearTimeout(gameState.feedbackTimeout);
    gameState.feedbackTimeout = null;
  }

  initGameState();
  gameState.startTime = Date.now();
  gameState.stats = loadStats();
  gameState.stats.gamesPlayed += 1;
  saveStats(gameState.stats);
  updateStatsDisplay();

  const completeBoard = generateCompleteGrid(gameState.size);
  if (!completeBoard) {
    // Keep the last good board so the user is never left with a blank grid.
    if (gameState.grid.length === 0) {
      gameState.grid = Array(gameState.size)
        .fill(0)
        .map(() => Array(gameState.size).fill(CELL_EMPTY));
      gameState.initialGrid = gameState.grid.map((row) => row.slice());
    }
    renderGrid();
    updateGame();
    const message = translations[gameState.currentLanguage].puzzleGenerationError;
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;
    statusEl.className = 'status-message warning';
    statusEl.classList.remove('hidden');
    const live = document.getElementById('sr-live');
    if (live) live.textContent = message;
    return;
  }

  const hideRatio = {
    easy: 0.3,
    medium: 0.5,
    hard: 0.7,
  }[gameState.difficulty] || 0.5;

  const board = completeBoard.map((row) => row.slice());
  const cellsToHide = Math.floor(gameState.size * gameState.size * hideRatio);
  let hidden = 0;

  while (hidden < cellsToHide) {
    const r = getRandomInt(0, gameState.size - 1);
    const c = getRandomInt(0, gameState.size - 1);
    if (board[r][c] !== CELL_EMPTY) {
      board[r][c] = CELL_EMPTY;
      hidden += 1;
    }
  }

  gameState.grid = board;
  gameState.initialGrid = board.map((row) => row.slice());
  renderGrid();
  updateStatus();
  startTimer();
}

function updateGame() {
  const { violations, hasViolations } = checkViolations(gameState.grid, gameState.size);
  gameState.violations = violations;
  gameState.hasViolations = hasViolations;
  gameState.isSolved = gameState.grid.every((row) => row.every((cell) => cell !== CELL_EMPTY)) && !hasViolations;

  if (hasViolations) {
    renderGrid();
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = translations[gameState.currentLanguage].violationMessage;
    statusEl.className = 'status-message warning';
    statusEl.classList.remove('hidden');
    const live = document.getElementById('sr-live');
    if (live) live.textContent = translations[gameState.currentLanguage].violationMessage;
  } else {
    renderGrid();
    updateStatus();
  }
  updateHintsDisplay();
}

function recordMove(r, c, oldValue, newValue) {
  if (gameState.initialGrid[r] === undefined || gameState.initialGrid[r][c] === undefined) return;
  if (gameState.initialGrid[r][c] !== CELL_EMPTY) return;
  gameState.moveHistory.push({ r, c, oldValue, newValue, ts: Date.now() });
}

function resetGame() {
  stopTimer();
  if (gameState.feedbackTimeout) {
    clearTimeout(gameState.feedbackTimeout);
    gameState.feedbackTimeout = null;
  }

  if (gameState.initialGrid.length === 0) return;
  gameState.grid = gameState.initialGrid.map((row) => row.slice());
  gameState.moveHistory = [];
  gameState.selectedCell = null;
  gameState.hasViolations = false;
  gameState.isSolved = false;
  gameState.startTime = Date.now();
  updateGame();
  startTimer();
}

function generateHints() {
  const { violations } = checkViolations(gameState.grid, gameState.size);
  if (!violations.reasons || violations.reasons.length === 0) return [];

  const t = translations[gameState.currentLanguage];
  const hints = [];
  const seen = new Set();

  for (const reason of violations.reasons) {
    let key;
    let text;
    if (reason.type === 'triplet') {
      const range = reason.direction === 'row'
        ? `columns ${reason.start + 1}-${reason.end + 1}`
        : `rows ${reason.start + 1}-${reason.end + 1}`;
      key = `triplet-${reason.direction}-${reason.row}-${reason.col}`;
      text = reason.direction === 'row'
        ? t.hintTripletRow.replace('{row}', String(reason.row + 1))
            .replace('{color}', reason.color)
            .replace('{range}', range)
        : t.hintTripletCol.replace('{col}', String(reason.col + 1))
            .replace('{color}', reason.color)
            .replace('{range}', range);
    } else if (reason.type === 'count') {
      if (reason.row !== undefined) {
        key = `count-row-${reason.row}`;
        text = t.hintCountRow.replace('{row}', String(reason.row + 1));
      } else {
        key = `count-col-${reason.col}`;
        text = t.hintCountCol.replace('{col}', String(reason.col + 1));
      }
    } else if (reason.type === 'uniqueness') {
      if (reason.row !== undefined) {
        key = `uniq-row-${reason.row}-${reason.otherRow}`;
        text = t.hintUniqRow
          .replace('{row}', String(reason.row + 1))
          .replace('{otherRow}', String(reason.otherRow + 1));
      } else {
        key = `uniq-col-${reason.col}-${reason.otherCol}`;
        text = t.hintUniqCol
          .replace('{col}', String(reason.col + 1))
          .replace('{otherCol}', String(reason.otherCol + 1));
      }
    }

    if (key && !seen.has(key)) {
      seen.add(key);
      hints.push(text);
    }
  }

  return hints.slice(0, 5);
}

function updateHintsDisplay() {
  const container = document.getElementById('hints-container');
  if (!container) return;
  const hints = generateHints();
  if (hints.length === 0) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  const t = translations[gameState.currentLanguage];
  container.innerHTML = `<ul class="hints-list">${hints.map((hint) => `<li>${hint}</li>`).join('')}</ul>`;
  container.classList.remove('hidden');
}

function handleCellClick(r, c) {
  if (gameState.initialGrid[r][c] !== CELL_EMPTY) return;

  const previousValue = gameState.grid[r][c];
  const nextValue = (previousValue + 1) % 3;
  gameState.selectedCell = { r, c };
  recordMove(r, c, previousValue, nextValue);
  gameState.grid[r][c] = nextValue;
  updateGame();
}

function undoLastMove() {
  if (gameState.moveHistory.length === 0) return;
  const last = gameState.moveHistory.pop();
  if (!last) return;
  if (gameState.initialGrid[last.r][last.c] !== CELL_EMPTY) return;

  gameState.grid[last.r][last.c] = last.oldValue;
  gameState.selectedCell = { r: last.r, c: last.c };
  updateGame();
}

function renderGrid() {
  const gridEl = document.getElementById('game-grid');
  gridEl.innerHTML = '';
  gridEl.style.gridTemplateColumns = `repeat(${gameState.size}, var(--cell-size))`;

  for (let r = 0; r < gameState.size; r++) {
    for (let c = 0; c < gameState.size; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.id = `cell-${r}-${c}`;
      cell.setAttribute('data-row', String(r));
      cell.setAttribute('data-col', String(c));
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('role', 'button');
      const value = gameState.grid[r][c];
      cell.setAttribute('aria-pressed', value === CELL_EMPTY ? 'false' : 'true');

      const locked = gameState.initialGrid[r][c] !== CELL_EMPTY;
      const valueName = value === CELL_RED ? 'Red' : value === CELL_BLUE ? 'Blue' : 'Empty';
      let label = `Row ${r + 1}, Column ${c + 1}, ${valueName}`;
      if (locked) label += ', Locked';
      cell.setAttribute('aria-label', label);

      if (locked) {
        cell.classList.add('locked');
      }

      if (gameState.selectedCell && gameState.selectedCell.r === r && gameState.selectedCell.c === c) {
        cell.classList.add('selected');
      }

      if (gameState.violations.rows[r] || gameState.violations.cols[c] || gameState.violations.cells[r][c]) {
        cell.classList.add('violation');
      }

      if (value === CELL_RED) {
        const circle = document.createElement('div');
        circle.className = 'circle red';
        cell.appendChild(circle);
      } else if (value === CELL_BLUE) {
        const circle = document.createElement('div');
        circle.className = 'circle blue';
        cell.appendChild(circle);
      }

      cell.addEventListener('click', () => handleCellClick(r, c));
      cell.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleCellClick(r, c);
        }
      });
      gridEl.appendChild(cell);
    }
  }
}

function updateStatsDisplay() {
  const stats = gameState.stats;
  document.getElementById('games-played').textContent = stats.gamesPlayed;
  document.getElementById('games-won').textContent = stats.gamesWon;
  document.getElementById('best-time').textContent = stats.bestTime ? `${stats.bestTime}s` : '-';

  const note = document.getElementById('stats-storage-note');
  if (!note) return;
  if (!gameState.storageAvailable) {
    note.textContent = translations[gameState.currentLanguage].storageUnavailable;
    note.classList.remove('hidden');
  } else {
    note.textContent = '';
    note.classList.add('hidden');
  }
}

function updateLanguageUI() {
  const t = translations[gameState.currentLanguage];

  document.title = t.title;
  document.getElementById('title').textContent = t.appTitle || t.title;
  document.getElementById('settings-title').textContent = t.settings;
  document.getElementById('language-label').textContent = t.language;
  document.getElementById('label-size').textContent = t.size;
  document.getElementById('label-difficulty').textContent = t.difficulty;
  document.getElementById('opt-easy').textContent = t.easy;
  document.getElementById('opt-medium').textContent = t.medium;
  document.getElementById('opt-hard').textContent = t.hard;
  document.getElementById('new-game-btn').textContent = t.newGame;
  document.getElementById('reset-btn').textContent = t.reset;
  document.getElementById('undo-btn').textContent = t.undo;
  document.getElementById('hint-btn').textContent = t.hint;
  document.getElementById('rules-title').textContent = t.howToPlayTitle;
  document.getElementById('instructions').textContent = t.instructions;
  document.getElementById('stat-games-played').textContent = t.gamesPlayed;
  document.getElementById('stat-games-won').textContent = t.gamesWon;
  document.getElementById('stat-best-time').textContent = t.bestTime;
  document.getElementById('language-select').value = gameState.currentLanguage;
  const resetStatsBtn = document.getElementById('reset-stats-btn');
  if (resetStatsBtn) resetStatsBtn.textContent = t.resetStats;

  const rulesListEl = document.getElementById('rules-list');
  if (rulesListEl) {
    rulesListEl.innerHTML = t.rules.map((ruleText) => `<li>${ruleText}</li>`).join('');
  }

  updateStatsDisplay();
}

function updateStatus() {
  const statusEl = document.getElementById('status-message');
  const liveEl = document.getElementById('sr-live');
  statusEl.classList.add('hidden');

  if (gameState.isSolved) {
    stopTimer();
    gameState.elapsedTime = Date.now() - gameState.startTime;
    const seconds = formatTime(gameState.elapsedTime);

    gameState.stats = loadStats();
    gameState.stats.gamesWon += 1;
    if (!gameState.stats.bestTime || seconds < gameState.stats.bestTime) {
      gameState.stats.bestTime = seconds;
    }
    saveStats(gameState.stats);
    updateStatsDisplay();

    const message = translations[gameState.currentLanguage].solvedMessageWithTime.replace('{time}', String(seconds));
    statusEl.textContent = message;
    statusEl.className = 'status-message success';
    statusEl.classList.remove('hidden');
    if (liveEl) liveEl.textContent = message;
  } else {
    if (liveEl) liveEl.textContent = '';
  }
}

function getStoredLanguage() {
  if (!storageAvailable()) return 'zh-tw';

  try {
    const savedLanguage = window.localStorage.getItem('puzzleLanguage');
    return savedLanguage && translations[savedLanguage] ? savedLanguage : 'zh-tw';
  } catch (error) {
    return 'zh-tw';
  }
}

function setupEventListeners() {
  document.getElementById('language-select').addEventListener('change', (event) => {
    gameState.currentLanguage = event.target.value;
    if (gameState.storageAvailable) {
      try {
        window.localStorage.setItem('puzzleLanguage', gameState.currentLanguage);
      } catch (error) {
        console.warn('Failed to save puzzle language:', error);
      }
    }
    updateLanguageUI();
    renderGrid();
  });

  document.getElementById('puzzle-size').addEventListener('change', (event) => {
    gameState.size = Number(event.target.value);
    generatePuzzle();
  });

  document.getElementById('puzzle-difficulty').addEventListener('change', (event) => {
    gameState.difficulty = event.target.value;
    generatePuzzle();
  });

  document.getElementById('new-game-btn').addEventListener('click', generatePuzzle);

  document.getElementById('hint-btn').addEventListener('click', () => {
    const hints = generateHints();
    const container = document.getElementById('hints-container');
    if (hints.length === 0) {
      container.classList.add('hidden');
      container.innerHTML = '';
      return;
    }
    container.classList.remove('hidden');
    container.innerHTML = `<ul class="hints-list">${hints.map((h) => `<li>${h}</li>`).join('')}</ul>`;
  });
  document.getElementById('reset-btn').addEventListener('click', resetGame);

  document.getElementById('undo-btn').addEventListener('click', undoLastMove);

  document.getElementById('reset-stats-btn').addEventListener('click', () => {
    gameState.stats = { gamesPlayed: 0, gamesWon: 0, bestTime: null };
    saveStats(gameState.stats);
    updateStatsDisplay();
  });

  document.addEventListener('keydown', (event) => {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName === 'SELECT') return;

    if (!gameState.selectedCell) {
      gameState.selectedCell = { r: 0, c: 0 };
    }

    const { r, c } = gameState.selectedCell;
    const size = gameState.size;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        gameState.selectedCell = { r: (r - 1 + size) % size, c };
        renderGrid();
        break;
      case 'ArrowDown':
        event.preventDefault();
        gameState.selectedCell = { r: (r + 1) % size, c };
        renderGrid();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        gameState.selectedCell = { r, c: (c - 1 + size) % size };
        renderGrid();
        break;
      case 'ArrowRight':
        event.preventDefault();
        gameState.selectedCell = { r, c: (c + 1) % size };
        renderGrid();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (gameState.initialGrid[r] && gameState.initialGrid[r][c] === CELL_EMPTY) {
          handleCellClick(r, c);
        }
        break;
      case '0':
      case '1':
      case '2': {
        event.preventDefault();
        const value = Number(event.key);
        if (gameState.initialGrid[r] && gameState.initialGrid[r][c] === CELL_EMPTY && gameState.grid[r][c] !== value) {
          recordMove(r, c, gameState.grid[r][c], value);
          gameState.grid[r][c] = value;
          updateGame();
        }
        break;
      }
      case 'z':
      case 'Z':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          undoLastMove();
        }
        break;
      default:
        break;
    }
  });
}

function initGame() {
  gameState.stats = loadStats();
  gameState.currentLanguage = getStoredLanguage();
  updateLanguageUI();
  updateStatsDisplay();
  setupEventListeners();
  generatePuzzle();
}

if (typeof window !== 'undefined') {
  window.addEventListener('load', initGame);
}
