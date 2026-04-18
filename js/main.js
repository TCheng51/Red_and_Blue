// Game Constants
const CELL_EMPTY = 0;
const CELL_RED = 1;
const CELL_BLUE = 2;

// Game State
let gameState = {
  size: 6,
  difficulty: "medium",
  grid: [],
  initialGrid: [],
  violations: { rows: [], cols: [], cells: [] },
  hasViolations: false,
  isSolved: false,
  currentLanguage: "zh-tw",
  startTime: null,
  elapsedTime: 0,
  violationMessageTimeout: null,
};

// Translations
const translations = {
  en: {
    languageName: "English",
    title: "Binary Puzzle - Red & Blue",
    size: "Size:",
    difficulty: "Difficulty:",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    newGame: "New Game",
    reset: "Reset",
    solvedMessage: "Congratulations! You solved the puzzle! 🎉",
    solvedMessageWithTime: "Congratulations! You solved the puzzle. The time taken was {time} seconds! 🎉",
    violationMessage: "There are violations in the grid. Keep going!",
    hintTriplet: "⚠ Three or more same colors in a row",
    hintColor: "⚠ Too many of the same color in this row/column",
    hintDuplicate: "⚠ This row/column is identical to another",
    howToPlayTitle: "How to Play Binary Puzzle:",
    instructions:
      "Click on an empty square to cycle its state: Empty → Red → Blue → Empty. Squares with gray background are part of the initial puzzle and cannot be changed. Highlighted areas indicate a rule violation.",
  },
  "zh-tw": {
    languageName: "繁體中文",
    title: "二進制拼圖-紅藍",
    size: "大小：",
    difficulty: "難度：",
    easy: "簡單",
    medium: "中等",
    hard: "困難",
    newGame: "新遊戲",
    reset: "重置",
    solvedMessage: "恭喜！您解決了拼圖！🎉",
    solvedMessageWithTime: "恭喜！您解決了拼圖。花費時間為 {time} 秒！🎉",
    violationMessage: "網格中存在違規。請繼續！",
    hintTriplet: "⚠ 一行或一列中有三個或以上相同顏色",
    hintColor: "⚠ 這行或這列的同一顏色過多",
    hintDuplicate: "⚠ 這行或這列與另一行/列相同",
    howToPlayTitle: "二進制拼圖玩法說明：",
    instructions:
      "點擊空格以切換其狀態：空白 → 紅色 → 藍色 → 空白。帶有灰色背景的方塊是初始拼圖的一部分，無法更改。高亮區域表示規則違規。",
  },
  "zh-cn": {
    languageName: "简体中文",
    title: "二进制拼图-红蓝",
    size: "大小：",
    difficulty: "难度：",
    easy: "简单",
    medium: "中等",
    hard: "困难",
    newGame: "新游戏",
    reset: "重置",
    solvedMessage: "恭喜！您解决了拼图！🎉",
    solvedMessageWithTime: "恭喜！您解决了拼图。花费时间为 {time} 秒！🎉",
    violationMessage: "网格中存在违规。请继续！",
    hintTriplet: "⚠ 一行或一列中有三个或以上相同颜色",
    hintColor: "⚠ 这行或这列的同一颜色过多",
    hintDuplicate: "⚠ 这行或这列与另一行/列相同",
    howToPlayTitle: "二进制拼图玩法说明：",
    instructions:
      "点击空格以切换其状态：空白 → 红色 → 蓝色 → 空白。带有灰色背景的方块是初始拼图的一部分，无法更改。高亮区域表示规则违规。",
  },
};

// Utility Functions
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Format elapsed time from milliseconds to seconds
 */
function formatTime(milliseconds) {
  return Math.floor(milliseconds / 1000);
}

/**
 * Generate hints based on detected violations
 */
function generateHints() {
  const t = translations[gameState.currentLanguage];
  const hints = new Set();
  const grid = gameState.grid;
  const size = gameState.size;
  const violations = gameState.violations;
  const targetCount = size / 2;

  // Check for three-in-a-row violations
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size - 2; c++) {
      if (
        violations.cells[r][c] &&
        grid[r][c] !== CELL_EMPTY &&
        grid[r][c] === grid[r][c + 1] &&
        grid[r][c] === grid[r][c + 2]
      ) {
        hints.add(t.hintTriplet);
        break;
      }
    }
  }

  for (let c = 0; c < size; c++) {
    for (let r = 0; r < size - 2; r++) {
      if (
        violations.cells[r][c] &&
        grid[r][c] !== CELL_EMPTY &&
        grid[r][c] === grid[r + 1][c] &&
        grid[r][c] === grid[r + 2][c]
      ) {
        hints.add(t.hintTriplet);
        break;
      }
    }
  }

  // Check for too many same color violations
  for (let r = 0; r < size; r++) {
    if (violations.rows[r]) {
      let isFull = true;
      let redCount = 0,
        blueCount = 0;
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === CELL_EMPTY) isFull = false;
        if (grid[r][c] === CELL_RED) redCount++;
        if (grid[r][c] === CELL_BLUE) blueCount++;
      }
      if (
        isFull &&
        size % 2 === 0 &&
        (redCount !== targetCount || blueCount !== targetCount)
      ) {
        hints.add(t.hintColor);
      }
    }
  }

  for (let c = 0; c < size; c++) {
    if (violations.cols[c]) {
      let isFull = true;
      let redCount = 0,
        blueCount = 0;
      for (let r = 0; r < size; r++) {
        if (grid[r][c] === CELL_EMPTY) isFull = false;
        if (grid[r][c] === CELL_RED) redCount++;
        if (grid[r][c] === CELL_BLUE) blueCount++;
      }
      if (
        isFull &&
        size % 2 === 0 &&
        (redCount !== targetCount || blueCount !== targetCount)
      ) {
        hints.add(t.hintColor);
      }
    }
  }

  // Check for duplicate row/column violations
  for (let r = 0; r < size; r++) {
    if (violations.rows[r]) {
      let rowIsFull = true;
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === CELL_EMPTY) rowIsFull = false;
      }
      if (rowIsFull) {
        hints.add(t.hintDuplicate);
      }
    }
  }

  for (let c = 0; c < size; c++) {
    if (violations.cols[c]) {
      let colIsFull = true;
      for (let r = 0; r < size; r++) {
        if (grid[r][c] === CELL_EMPTY) colIsFull = false;
      }
      if (colIsFull) {
        hints.add(t.hintDuplicate);
      }
    }
  }

  return Array.from(hints);
}

/**
 * Display hints with formatted HTML
 */
function displayHints(hints) {
  const hintsContainer = document.getElementById("hints-container");
  hintsContainer.innerHTML = "";

  if (hints.length > 0) {
    const hintsList = document.createElement("ul");
    hintsList.className = "hints-list";
    hints.forEach((hint) => {
      const li = document.createElement("li");
      li.textContent = hint;
      hintsList.appendChild(li);
    });
    hintsContainer.appendChild(hintsList);
    hintsContainer.classList.remove("hidden");
  } else {
    hintsContainer.classList.add("hidden");
  }
}
  const violations = {
    rows: Array(size).fill(false),
    cols: Array(size).fill(false),
    cells: Array(size)
      .fill(0)
      .map(() => Array(size).fill(false)),
  };
  let hasViolations = false;

  const targetCount = size / 2;
  const rowStrings = new Map();
  const colStrings = Array(size)
    .fill(0)
    .map(() => []);

  // Check rows
  for (let r = 0; r < size; r++) {
    let redCountRow = 0;
    let blueCountRow = 0;
    let currentRowString = "";
    let rowIsFull = true;

    for (let c = 0; c < size; c++) {
      const cell = grid[r][c];
      currentRowString += cell;
      colStrings[c].push(cell);

      if (cell === CELL_RED) redCountRow++;
      else if (cell === CELL_BLUE) blueCountRow++;
      else rowIsFull = false;

      // Check horizontal triplets
      if (c >= 2) {
        if (
          cell !== CELL_EMPTY &&
          cell === grid[r][c - 1] &&
          cell === grid[r][c - 2]
        ) {
          violations.cells[r][c] = true;
          violations.cells[r][c - 1] = true;
          violations.cells[r][c - 2] = true;
          violations.rows[r] = true;
          hasViolations = true;
        }
      }

      // Check vertical triplets
      if (r >= 2) {
        if (
          cell !== CELL_EMPTY &&
          cell === grid[r - 1][c] &&
          cell === grid[r - 2][c]
        ) {
          violations.cells[r][c] = true;
          violations.cells[r - 1][c] = true;
          violations.cells[r - 2][c] = true;
          violations.cols[c] = true;
          hasViolations = true;
        }
      }
    }

    if (rowIsFull) {
      if (
        size % 2 === 0 &&
        (redCountRow !== targetCount || blueCountRow !== targetCount)
      ) {
        violations.rows[r] = true;
        hasViolations = true;
      }

      if (!violations.rows[r]) {
        if (rowStrings.has(currentRowString)) {
          violations.rows[r] = true;
          violations.rows[rowStrings.get(currentRowString)] = true;
          hasViolations = true;
        } else {
          rowStrings.set(currentRowString, r);
        }
      }
    }
  }

  // Check columns
  const colSet = new Map();
  for (let c = 0; c < size; c++) {
    const currentColArray = colStrings[c];
    let redCountCol = 0;
    let blueCountCol = 0;
    let currentColString = "";
    let colIsFull = true;

    for (let r = 0; r < size; r++) {
      const cell = currentColArray[r];
      currentColString += cell;
      if (cell === CELL_RED) redCountCol++;
      else if (cell === CELL_BLUE) blueCountCol++;
      else colIsFull = false;
    }

    if (colIsFull) {
      if (
        size % 2 === 0 &&
        (redCountCol !== targetCount || blueCountCol !== targetCount)
      ) {
        violations.cols[c] = true;
        hasViolations = true;
      }

      if (!violations.cols[c]) {
        if (colSet.has(currentColString)) {
          violations.cols[c] = true;
          violations.cols[colSet.get(currentColString)] = true;
          hasViolations = true;
        } else {
          colSet.set(currentColString, c);
        }
      }
    }
  }

  return { violations, hasViolations };
}

/**
 * Generate a complete valid Binary Puzzle grid using backtracking
 */
function generateCompleteGrid(size) {
  const grid = Array(size)
    .fill(0)
    .map(() => Array(size).fill(CELL_EMPTY));
  const targetCount = size / 2;

  const solve = (r, c) => {
    if (r === size) return true;

    const nextR = c === size - 1 ? r + 1 : r;
    const nextC = c === size - 1 ? 0 : c + 1;

    const colors = [CELL_RED, CELL_BLUE];
    if (Math.random() < 0.5) colors.reverse();

    for (const color of colors) {
      grid[r][c] = color;

      let tripletViolation = false;
      if (
        c >= 2 &&
        grid[r][c] === grid[r][c - 1] &&
        grid[r][c] === grid[r][c - 2]
      )
        tripletViolation = true;
      if (
        r >= 2 &&
        grid[r][c] === grid[r - 1][c] &&
        grid[r][c] === grid[r - 2][c]
      )
        tripletViolation = true;

      if (tripletViolation) {
        grid[r][c] = CELL_EMPTY;
        continue;
      }

      let rowIsFull = true;
      let colIsFull = true;
      for (let i = 0; i < size; i++) {
        if (grid[r][i] === CELL_EMPTY) rowIsFull = false;
        if (grid[i][c] === CELL_EMPTY) colIsFull = false;
      }

      if (rowIsFull && size % 2 === 0) {
        let redCount = 0,
          blueCount = 0;
        for (let i = 0; i < size; i++) {
          if (grid[r][i] === CELL_RED) redCount++;
          if (grid[r][i] === CELL_BLUE) blueCount++;
        }
        if (redCount !== targetCount || blueCount !== targetCount) {
          grid[r][c] = CELL_EMPTY;
          continue;
        }

        let currentRowString = "";
        for (let i = 0; i < size; i++) currentRowString += grid[r][i];
        let isRowUnique = true;
        for (let prevR = 0; prevR < r; prevR++) {
          let prevRowString = "";
          for (let i = 0; i < size; i++) prevRowString += grid[prevR][i];
          if (prevRowString === currentRowString) {
            isRowUnique = false;
            break;
          }
        }
        if (!isRowUnique) {
          grid[r][c] = CELL_EMPTY;
          continue;
        }
      }

      if (colIsFull && size % 2 === 0) {
        let redCount = 0,
          blueCount = 0;
        for (let i = 0; i < size; i++) {
          if (grid[i][c] === CELL_RED) redCount++;
          if (grid[i][c] === CELL_BLUE) blueCount++;
        }
        if (redCount !== targetCount || blueCount !== targetCount) {
          grid[r][c] = CELL_EMPTY;
          continue;
        }

        let currentColString = "";
        for (let i = 0; i < size; i++) currentColString += grid[i][c];
        let isColUnique = true;
        for (let prevC = 0; prevC < c; prevC++) {
          let prevColString = "";
          for (let i = 0; i < size; i++) prevColString += grid[i][prevC];
          if (prevColString === currentColString) {
            isColUnique = false;
            break;
          }
        }
        if (!isColUnique) {
          grid[r][c] = CELL_EMPTY;
          continue;
        }
      }

      if (solve(nextR, nextC)) return true;
      grid[r][c] = CELL_EMPTY;
    }
    return false;
  };

  let attempts = 0;
  const MAX_ATTEMPTS = 100;
  while (attempts < MAX_ATTEMPTS) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        grid[r][c] = CELL_EMPTY;
      }
    }
    if (solve(0, 0)) return grid;
    attempts++;
  }

  return Array(size)
    .fill(0)
    .map(() => Array(size).fill(CELL_EMPTY));
}

/**
 * Generate new puzzle based on size and difficulty
 */
function generatePuzzle() {
  const size = gameState.size;
  const difficulty = gameState.difficulty;

  gameState.isSolved = false;
  gameState.hasViolations = false;
  gameState.startTime = Date.now();
  gameState.elapsedTime = 0;
  gameState.violations = {
    rows: Array(size).fill(false),
    cols: Array(size).fill(false),
    cells: Array(size)
      .fill(0)
      .map(() => Array(size).fill(false)),
  };

  const completeGrid = generateCompleteGrid(size);
  if (!completeGrid || completeGrid[0][0] === CELL_EMPTY) {
    gameState.grid = Array(size)
      .fill(0)
      .map(() => Array(size).fill(CELL_EMPTY));
    gameState.initialGrid = Array(size)
      .fill(0)
      .map(() => Array(size).fill(CELL_EMPTY));
    return;
  }

  const getCellsToHidePercentage = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return 0.3;
      case "medium":
        return 0.5;
      case "hard":
        return 0.7;
      default:
        return 0.5;
    }
  };

  const cellsToHide = Math.floor(
    size * size * getCellsToHidePercentage(difficulty),
  );
  const newGrid = JSON.parse(JSON.stringify(completeGrid));
  const newInitialGrid = Array(size)
    .fill(0)
    .map(() => Array(size).fill(CELL_EMPTY));

  let hiddenCount = 0;
  while (hiddenCount < cellsToHide) {
    const r = getRandomInt(0, size - 1);
    const c = getRandomInt(0, size - 1);
    if (newGrid[r][c] !== CELL_EMPTY) {
      newGrid[r][c] = CELL_EMPTY;
      hiddenCount++;
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (newGrid[r][c] !== CELL_EMPTY) {
        newInitialGrid[r][c] = newGrid[r][c];
      }
    }
  }

  gameState.grid = newGrid;
  gameState.initialGrid = newInitialGrid;
  renderGrid();
  updateStatus();
}

/**
 * Handle cell click
 */
function handleCellClick(r, c) {
  if (gameState.initialGrid[r][c] !== CELL_EMPTY) return;

  gameState.grid[r][c] = (gameState.grid[r][c] + 1) % 3;
  updateGame();
}

/**
 * Update game state after cell change
 */
function updateGame() {
  const size = gameState.size;
  const grid = gameState.grid;

  let allCellsFilled = true;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === CELL_EMPTY) {
        allCellsFilled = false;
        break;
      }
    }
    if (!allCellsFilled) break;
  }

  const { violations, hasViolations } = checkViolations(grid, size);
  gameState.violations = violations;
  gameState.hasViolations = hasViolations;
  gameState.isSolved = allCellsFilled && !hasViolations;

  renderGrid();
  updateStatus();
}

/**
 * Reset current game
 */
function resetGame() {
  const size = gameState.size;
  gameState.grid = JSON.parse(JSON.stringify(gameState.initialGrid));
  gameState.isSolved = false;
  gameState.hasViolations = false;
  gameState.startTime = Date.now();
  gameState.elapsedTime = 0;
  gameState.violations = {
    rows: Array(size).fill(false),
    cols: Array(size).fill(false),
    cells: Array(size)
      .fill(0)
      .map(() => Array(size).fill(false)),
  };
  renderGrid();
  updateStatus();
}

/**
 * Render the game grid
 */
function renderGrid() {
  const gridElement = document.getElementById("game-grid");
  const size = gameState.size;
  gridElement.innerHTML = "";
  gridElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      if (gameState.initialGrid[r][c] !== CELL_EMPTY) {
        cell.classList.add("locked");
      }

      if (gameState.violations.rows[r] || gameState.violations.cols[c]) {
        cell.classList.add("violation");
      }

      if (gameState.violations.cells[r][c]) {
        cell.style.borderColor = "var(--orange2)";
      }

      const cellValue = gameState.grid[r][c];
      if (cellValue === CELL_RED) {
        const circle = document.createElement("div");
        circle.className = "circle red";
        cell.appendChild(circle);
      } else if (cellValue === CELL_BLUE) {
        const circle = document.createElement("div");
        circle.className = "circle blue";
        cell.appendChild(circle);
      }

      cell.addEventListener("click", () => handleCellClick(r, c));
      gridElement.appendChild(cell);
    }
  }
}

/**
 * Update status message
 */
function updateStatus() {
  const statusElement = document.getElementById("status-message");
  const t = translations[gameState.currentLanguage];

  statusElement.classList.add("hidden");

  // Clear any pending violation message timeout
  if (gameState.violationMessageTimeout) {
    clearTimeout(gameState.violationMessageTimeout);
    gameState.violationMessageTimeout = null;
  }

  if (gameState.isSolved) {
    gameState.elapsedTime = Date.now() - gameState.startTime;
    const formattedTime = formatTime(gameState.elapsedTime);
    const messageTemplate = t.solvedMessageWithTime || t.solvedMessage;
    const message = messageTemplate.includes("{time}")
      ? messageTemplate.replace("{time}", formattedTime)
      : t.solvedMessage;
    statusElement.textContent = message;
    statusElement.classList.remove("hidden");
    statusElement.className = "status-message success";
    document.getElementById("hints-container").classList.add("hidden");
  } else if (gameState.hasViolations) {
    // Delay violation message and hints by 1 second
    gameState.violationMessageTimeout = setTimeout(() => {
      statusElement.textContent = t.violationMessage;
      statusElement.classList.remove("hidden");
      statusElement.className = "status-message warning";

      const hints = generateHints();
      displayHints(hints);
    }, 1000);
  } else {
    document.getElementById("hints-container").classList.add("hidden");
  }
}

/**
 * Update UI text based on language
 */
function updateLanguageUI() {
  const t = translations[gameState.currentLanguage];

  document.getElementById("title").textContent = t.title;
  document.getElementById("label-size").textContent = t.size;
  document.getElementById("label-difficulty").textContent = t.difficulty;
  document.getElementById("opt-easy").textContent = t.easy;
  document.getElementById("opt-medium").textContent = t.medium;
  document.getElementById("opt-hard").textContent = t.hard;
  document.getElementById("new-game-btn").textContent = t.newGame;
  document.getElementById("reset-btn").textContent = t.reset;
  document.getElementById("rules-title").textContent = t.howToPlayTitle;
  document.getElementById("instructions").textContent = t.instructions;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  document.getElementById("language-select").addEventListener("change", (e) => {
    gameState.currentLanguage = e.target.value;
    updateLanguageUI();
  });

  document.getElementById("puzzle-size").addEventListener("change", (e) => {
    gameState.size = parseInt(e.target.value);
    generatePuzzle();
  });

  document
    .getElementById("puzzle-difficulty")
    .addEventListener("change", (e) => {
      gameState.difficulty = e.target.value;
      generatePuzzle();
    });

  document
    .getElementById("new-game-btn")
    .addEventListener("click", generatePuzzle);
  document.getElementById("reset-btn").addEventListener("click", resetGame);
}

/**
 * Initialize the game
 */
function initGame() {
  setupEventListeners();
  generatePuzzle();
}

// Start the game when the page loads
window.onload = initGame;