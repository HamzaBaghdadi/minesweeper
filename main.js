// script.js

const game = document.getElementById("game");
const message = document.createElement("div");
const restartButton = document.createElement("button");
const rows = 16;
const cols = 16;
const minesCount = 40;
let board = [];
let minePositions = [];
let revealedCount = 0; // Track the number of revealed cells
let gameOver = false; // Track if the game is over

// Initialize the game
function init() {
  createBoard();
  placeMines();
  updateNumbers();
  renderBoard();
  gameOver = false; // Reset game over state
  revealedCount = 0; // Reset revealed count
  message.textContent = ""; // Clear message
}

// Create the game board
function createBoard() {
  board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      revealed: false,
      flag: false,
      count: 0,
    }))
  );
}

// Place mines randomly on the board
function placeMines() {
  let placedMines = 0;
  minePositions = [];

  while (placedMines < minesCount) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);

    if (!board[row][col].mine) {
      board[row][col].mine = true;
      minePositions.push({ row, col });
      placedMines++;
    }
  }
}

// Update numbers around mines
function updateNumbers() {
  minePositions.forEach(({ row, col }) => {
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < rows && c >= 0 && c < cols && !board[r][c].mine) {
          board[r][c].count++;
        }
      }
    }
  });
}

// Render the game board
function renderBoard() {
  game.innerHTML = "";
  game.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellElement = document.createElement("div");
      cellElement.classList.add("cell");
      cellElement.dataset.row = rowIndex;
      cellElement.dataset.col = colIndex;

      if (!gameOver) {
        cellElement.addEventListener("click", handleCellClick);
        cellElement.addEventListener("contextmenu", handleRightClick);
        cellElement.addEventListener("dblclick", handleCellDoubleClick);
      }

      if (cell.revealed) {
        cellElement.classList.add("revealed");
        if (cell.mine) {
          cellElement.classList.add("mine");
        } else if (cell.count) {
          cellElement.textContent = cell.count;
        }
      } else if (cell.flag) {
        cellElement.classList.add("flag");
      }

      game.appendChild(cellElement);
    });
  });
}

// Handle cell click
function handleCellClick(event) {
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (!gameOver) {
    revealCell(row, col);
    renderBoard();
    checkWin();
  }
}

// Handle right-click for flagging
function handleRightClick(event) {
  event.preventDefault();
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (!gameOver) {
    if (!board[row][col].revealed) {
      board[row][col].flag = !board[row][col].flag;
      renderBoard();
    }
  }
}

// Handle cell double-click
function handleCellDoubleClick(event) {
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (!gameOver && board[row][col].revealed && board[row][col].count > 0) {
    const surroundingFlags = countSurroundingFlags(row, col);

    if (surroundingFlags === board[row][col].count) {
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (
            r >= 0 &&
            r < rows &&
            c >= 0 &&
            c < cols &&
            !board[r][c].flag &&
            !board[r][c].revealed
          ) {
            revealCell(r, c);
          }
        }
      }
      renderBoard();
      checkWin();
    }
  }
}

// Count the number of flags around a cell
function countSurroundingFlags(row, col) {
  let count = 0;

  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c].flag) {
        count++;
      }
    }
  }

  return count;
}

// Reveal cell and adjacent cells if it's not a mine
function revealCell(row, col) {
  if (board[row][col].revealed || board[row][col].flag) return;

  board[row][col].revealed = true;
  revealedCount++; // Increment revealed cell count

  if (board[row][col].mine) {
    message.textContent = "Game Over!";
    gameOver = true;
    // Reveal all mines
    board.forEach((row) =>
      row.forEach((cell) => {
        if (cell.mine) cell.revealed = true;
      })
    );
    renderBoard();
    return;
  }

  if (board[row][col].count === 0) {
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
          revealCell(r, c);
        }
      }
    }
  }
}

// Check if the player has won
function checkWin() {
  if (revealedCount === rows * cols - minesCount) {
    message.textContent = "You win!";
    gameOver = true;
    // Highlight all mines in green
    minePositions.forEach(({ row, col }) => {
      const cellElement = document.querySelector(
        `.cell[data-row='${row}'][data-col='${col}']`
      );
      if (cellElement) {
        cellElement.classList.add("win");
      }
    });
  }
}

// Restart the game
function restartGame() {
  init();
  renderBoard();
}

// Create restart button
function createRestartButton() {
  restartButton.id = "restartButton";
  restartButton.innerHTML =
    '<img src="https://www.freeiconspng.com/thumbs/restart-icon/black-panel-restart-system-icon--6.png" alt="Restart">';
  restartButton.addEventListener("click", restartGame);
  document.body.appendChild(restartButton);
}

// Create message display
function createMessageDisplay() {
  message.id = "gameMessage";
  document.body.appendChild(message);
}

// Start the game
init();
createRestartButton();
createMessageDisplay();
