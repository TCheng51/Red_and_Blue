# 二進制拼圖 - 紅藍 | Binary Puzzle - Red and Blue

一個基於網頁的二進制拼圖遊戲，支援多種語言和難度設定。

A web-based binary puzzle game with multi-language support and difficulty settings.

## 🎮 遊戲特色 | Game Features

- **多語言支援**：繁體中文、簡體中文、英文
- **多種網格大小**：4x4、6x6、8x8、10x10
- **三種難度**：簡單、中等、困難
- **即時規則檢查**：高亮顯示違規區域
- **響應式設計**：支援桌面和行動裝置
- **計時功能**：記錄完成時間

- **Multi-language support**: Traditional Chinese, Simplified Chinese, English
- **Multiple grid sizes**: 4x4, 6x6, 8x8, 10x10
- **Three difficulty levels**: Easy, Medium, Hard
- **Real-time rule checking**: Highlights violations
- **Responsive design**: Works on desktop and mobile devices
- **Timer feature**: Records completion time

## 🎯 遊戲規則 | Game Rules

### 基本規則 | Basic Rules

1. 將每個空格填入紅色或藍色圓圈
   - Fill each empty cell with a red or blue circle

2. 任何行或列中，不能有超過兩個相同顏色的相鄰圓圈
   - No more than two adjacent circles of the same color in any row or column

3. 每個行和每個列必須包含相同數量的紅色和藍色圓圈（僅適用於偶數大小網格）
   - Each row and column must contain equal numbers of red and blue circles (only for even-sized grids)

4. 所有行必須是唯一的，不能有完全相同的模式
   - All rows must be unique, no identical patterns

5. 所有列必須是唯一的，不能有完全相同的模式
   - All columns must be unique, no identical patterns

### 操作方式 | How to Play

- 點擊空格切換狀態：空白 → 紅色 → 藍色 → 空白
  - Click empty cells to cycle: Empty → Red → Blue → Empty
- 灰色背景的方塊是初始拼圖，無法更改
  - Gray background squares are part of the initial puzzle and cannot be changed
- 高亮區域表示規則違規
  - Highlighted areas indicate rule violations

## 🚀 快速開始 | Quick Start

### 方法一：直接開啟 | Method 1: Direct Open

1. 下載整個專案資料夾
   - Download the entire project folder
2. 雙擊 `index.html` 在瀏覽器中開啟
   - Double-click `index.html` to open in browser

### 方法二：本地伺服器 | Method 2: Local Server

```bash
# 使用 Python | Using Python
python -m http.server 8000

# 使用 Node.js | Using Node.js
npx serve .

# 然後訪問 | Then visit
http://localhost:8000
```

## 📁 專案結構 | Project Structure

```
Binary Puzzle/
├── index.html          # 主頁面 | Main page
├── css/
│   └── style.css      # 樣式表 | Stylesheet
├── js/
│   └── main.js        # 遊戲邏輯 | Game logic
└── README.md          # 說明文件 | Documentation
```

## 🛠️ 技術實現 | Technical Implementation

- **前端技術**：HTML5、CSS3、JavaScript (ES6+)
- **設計特色**：響應式佈局、現代化 UI、流暢動畫
- **演算法**：回溯法生成拼圖、實時規則驗證
- **國際化**：完整的多語言支援系統

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Design**: Responsive layout, modern UI, smooth animations
- **Algorithms**: Backtracking for puzzle generation, real-time rule validation
- **Internationalization**: Complete multi-language support system

## 🎨 自訂與擴展 | Customization & Extension

### 新增語言 | Adding Languages

在 `js/main.js` 的 `translations` 物件中新增語言包：
Add language pack in `translations` object in `js/main.js`:

```javascript
const translations = {
  // 現有語言...
  "your-lang-code": {
    languageName: "Your Language",
    title: "Binary Puzzle - Red & Blue",
    // ... 其他翻譯
  },
};
```

### 調整難度 | Adjusting Difficulty

修改 `js/main.js` 中的難度參數：
Modify difficulty parameters in `js/main.js`:

```javascript
// 調整初始填充比例 | Adjust initial fill ratio
const difficultySettings = {
  easy: 0.4, // 40% 預填充 | 40% pre-filled
  medium: 0.3, // 30% 預填充 | 30% pre-filled
  hard: 0.2, // 20% 預填充 | 20% pre-filled
};
```

## 🤝 貢獻 | Contributing

歡迎提交 Issue 和 Pull Request！
Issues and Pull Requests are welcome!

1. Fork 此專案 | Fork this project
2. 建立功能分支 | Create feature branch (`git checkout -b feature/AmazingFeature`)
3. 提交變更 | Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 | Push to branch (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request | Open Pull Request

## 📄 授權 | License

此專案採用 MIT 授權條款。
This project is licensed under the MIT License.

## 🙏 致謝 | Acknowledgments

- 感謝所有測試玩家的回饋
- 靈感來源於經典的二進制拼圖遊戲
- 使用現代網頁技術實現流暢體驗

- Thanks to all testing players for feedback
- Inspired by classic binary puzzle games
- Built with modern web technologies for smooth experience

---

**享受遊戲！| Enjoy the game! 🎮**
