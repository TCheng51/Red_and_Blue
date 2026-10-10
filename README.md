# Binary Puzzle - Red and Blue | 二進制拼圖 - 紅藍

A simple web game. Fill the grid with red and blue circles following three rules.

一個簡單的網頁遊戲。用紅色和藍色圓圈填滿網格，遵守三條規則。

## Rules | 規則

1. No three same colors in a row (horizontally or vertically).
   任何行或列中，不能有三個相同顏色相鄰。
2. A full row or column must have equal red and blue (even-sized grids only).
   填滿時，每行每列的紅藍數量必須相等（僅適用於偶數大小網格）。
3. All rows and all columns must be unique.
   所有行和列都不能重複。

## How to play | 操作方式

- Click a cell to cycle: Empty → Red → Blue → Empty.
  點擊格子循環切換：空白 → 紅色 → 藍色 → 空白。
- Or select with arrow keys, then press `1` (Red), `2` (Blue), `0` (Empty).
  或用方向鍵選擇，再按 `1`（紅）、`2`（藍）、`0`（空白）。
- `Ctrl+Z` or the Undo button reverses your last move.
  `Ctrl+Z` 或「復原」按鈕可還原上一步。
- Gray cells are locked (the starting puzzle). Red highlights show rule violations.
  灰色格子是鎖定的初始拼圖。紅色高亮表示違規。

## Features | 特色

- 3 languages: 繁體中文 / 简体中文 / English
- Grid sizes: 4x4, 6x6, 8x8, 10x10
- Difficulties: Easy, Medium, Hard
- Live rule checking, hints, timer, stats (saved in your browser)
- Keyboard and screen-reader friendly

## Quick start | 快速開始

Just open `index.html` in a browser. Or serve the folder:

直接雙擊開啟 `index.html`。或啟動本地伺服器：

```bash
python -m http.server 8000
# then visit | 然後訪問 http://localhost:8000
```

## Tests | 測試

```bash
node tests/validator-test.js
```

## Project structure | 專案結構

```text
├── index.html          # Page | 頁面
├── css/style.css       # Styles | 樣式
├── js/main.js          # Game logic | 遊戲邏遊戲邏輯
└── tests/validator-test.js  # Rule tests | 規則測試
```

License | 授權: MIT
