const ROWS = 6;
const COLS = 7;
const DEPTH_LIMIT = 4; // Reduced depth for performance and faster moves

let player1Color = 'blue';
let player2Color = 'yellow';
let currentPlayer = 1;
let gameMode = null;
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const boardDiv = document.getElementById('board');
const statusDiv = document.getElementById('status');
const colorChoiceDiv = document.getElementById('option');
const playerOptButton = document.getElementById('player-opt');
const aiOptButton = document.getElementById('ai-opt');
const audioPlayer = document.getElementById('background-music');
    
if (audioPlayer) {
  audioPlayer.volume = 0.1;
} else {
  console.error("Audio player element not found.");
}

// Step 1: Choose game mode
playerOptButton.addEventListener('click', () => selectGameMode('player'));
aiOptButton.addEventListener('click', () => selectGameMode('ai'));

function selectGameMode(mode) {
  gameMode = mode;

  playerOptButton.classList.remove('highlighted');
  aiOptButton.classList.remove('highlighted');
  if (mode === 'player') {
    playerOptButton.classList.add('highlighted');
  } else {
    aiOptButton.classList.add('highlighted');
  }

  document.getElementById('player-option').style.display = 'none';
  colorChoiceDiv.style.display = 'flex';

// Disc color picker
  if (!yellowCircle.hasListener) {
    yellowCircle.addEventListener('click', () => chooseColor('yellow'));
    yellowCircle.hasListener = true;
  }

  if (!blueCircle.hasListener) {
    blueCircle.addEventListener('click', () => chooseColor('blue'));
    blueCircle.hasListener = true;
  }
}

// Event listeners for color choice
document.getElementById('blue-side-button').addEventListener('click', () => chooseColor('blue'));
document.getElementById('yellow-side-button').addEventListener('click', () => chooseColor('yellow'));

function chooseColor(color) {
  player1Color = color;
  player2Color = color === 'blue' ? 'yellow' : 'blue';

  document.getElementById('option').style.display = 'none';
  document.getElementById('game-board').style.display = 'none';
  document.getElementById('logo').style.display = 'none';
  document.getElementById('player-opt').style.display = 'none';
  document.getElementById('ai-opt').style.display = 'none';
  document.getElementById('blue-side-button').style.display = 'none';
  document.getElementById('yellow-side-button').style.display = 'none';

// For board Creation
  createBoard();
  statusDiv.textContent = "Player 1's turn";
}

function createBoard() {
  boardDiv.innerHTML = '';

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('click', handleMove);
      boardDiv.appendChild(cell);
    }
  }
}

// Add pop-up modal HTML structure dynamically
// Show the Result Popup after a game result is displayed
function showResultPopup(winner) {
  const popup = document.createElement('div');
  popup.id = 'result-popup';
  let gifSrc = '';
  let message = '';
  let exitButtonHTML = ''; // Variable to hold Exit button HTML

  if (winner === 'AI') {
    gifSrc = 'ai wins.gif';  // Use the GIF intended for AI wins
    message = 'AI wins!';
    exitButtonHTML = '<button id="exit-button" onclick="exitToHome()">Back to Home</button>';
  } else if (winner === 'Player 1') {
    gifSrc = 'player wins.gif';  // Use the GIF intended for Player 1 wins
    message = 'Player 1 wins!';
    exitButtonHTML = '<button id="exit-button" onclick="exitToHome()">Back to Home</button>';
  } else if (winner === 'Player 2') {
    gifSrc = 'player2-wins.gif';  // Use the GIF intended for Player 2 wins
    message = 'Player 2 wins!';
    exitButtonHTML = '<button id="exit-button" onclick="exitToHome()">Back to Home</button>';
  } else if (winner === 'Draw') {
    gifSrc = 'draw.gif';  // Use the GIF intended for a draw
    message = 'It\'s a Draw!';
  }

  // Create the popup content
  popup.innerHTML = `
    <div id="popup-content">
      <h2>${message}</h2>
      <img src="${gifSrc}" alt="${message}" id="winner-gif">
      <button id="try-again" onclick="restartGame()">Play Again</button>
      ${exitButtonHTML} <!-- Conditionally add Exit button here -->
    </div>
  `;

  document.body.appendChild(popup);
  disableBoard();
}

// Function to handle exiting to the home page
function exitToHome() {
  window.location.href = 'index.html';  // Redirect to the home page (change 'index.html' to your actual home page URL)
}

// Restart the game
function restartGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  currentPlayer = 1;
  createBoard();
  statusDiv.textContent = "Player 1's turn";
  document.getElementById('result-popup').remove();
}

function handleMove(event) {
  const col = parseInt(event.target.dataset.col);

  if (makeMove(col, currentPlayer)) {
    const winningCells = checkWin(currentPlayer);

    if (winningCells) {
      statusDiv.textContent = `Player ${currentPlayer} wins!`;

      // Apply the highlight effect to the winning cells
      highlightWinningCells(winningCells);

      setTimeout(() => {
        showResultPopup(`Player ${currentPlayer}`);
      }, 1000);

      return;
    }

    if (checkDraw()) {
      statusDiv.textContent = "It's a Draw!";
      setTimeout(() => {
        showResultPopup("Draw");
      }, 1000);
      return;
    }

    if (gameMode === 'player') {
      currentPlayer = currentPlayer === 1 ? 2 : 1;
      statusDiv.textContent = `Player ${currentPlayer}'s turn`;
    } else if (gameMode === 'ai') {
      currentPlayer = 2; // AI's turn
      statusDiv.textContent = "AI's Turn";
      setTimeout(aiMove, 500);
    }
  }
}

function makeMove(col, player) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) {
      board[row][col] = player;
      updateBoardUI(row, col, player);
      return true;
    }
  }
  return false;
}

function updateBoardUI(row, col, player) {
  const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
  cell.classList.add(player === 1 ? 'player1' : 'player2');
  cell.style.backgroundColor = player === 1 ? player1Color : player2Color;
}

function checkWin(player) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === player) {
        // Check each direction and return the winning cells if found
        let winningCells;
        winningCells = getWinningCells(r, c, 1, 0, player); // Vertical
        if (winningCells) return winningCells;

        winningCells = getWinningCells(r, c, 0, 1, player); // Horizontal
        if (winningCells) return winningCells;

        winningCells = getWinningCells(r, c, 1, 1, player); // Diagonal \
        if (winningCells) return winningCells;

        winningCells = getWinningCells(r, c, 1, -1, player); // Diagonal /
        if (winningCells) return winningCells;
      }
    }
  }
  return null;
}

//Checks specific direction a consecutive strak of 4 discs belonging to a specific player
function getWinningCells(row, col, rowDir, colDir, player) {
  const cells = [];
  for (let i = 0; i < 4; i++) {
    const r = row + i * rowDir;
    const c = col + i * colDir;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) return null;
    cells.push({ row: r, col: c });
  }
  return cells;
}

function highlightWinningCells(cells) {
    cells.forEach(({ row, col }) => {
      const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
      cell.classList.add('highlight'); // Add a CSS class to highlight the cell
    });
  }

function checkDraw() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col] === 0) return false;
    }
  }
  return true;
}

//Checks a specific direction for a consecutive streak of 4 discs belonging to a given player
function checkDirection(row, col, rowDir, colDir, player) {
  let count = 0;
  for (let i = 0; i < 4; i++) {
    const r = row + i * rowDir;
    const c = col + i * colDir;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
    count++;
  }
  return count === 4;
}

// Makes the AI's move by using the Minimax algorithm and updates the game state
function aiMove() {
  if (gameMode !== 'ai') return;

  // Get the best column for the AI move using the Minimax algorithm
  const { col } = minimax(board, DEPTH_LIMIT, -Infinity, Infinity, true);
  if (col !== null) {
    makeMove(col, currentPlayer);
    
    const winningCells = checkWin(currentPlayer);
    if (winningCells) {
      statusDiv.textContent = "AI wins!";

      // Apply the highlight effect to the winning cells
      highlightWinningCells(winningCells);

      // Delay showing the popup by 3 seconds
      setTimeout(() => {
        showResultPopup("AI");
      }, 1000);

      disableBoard();
      return;
    }

    if (checkDraw()) {
      statusDiv.textContent = "It's a Draw!";
      setTimeout(() => {
        showResultPopup("Draw");
      }, 1000);
      return;
    }

    // Switch back to Player 1 after AI’s move
    currentPlayer = 1;
    statusDiv.textContent = "Player 1's turn";
  }
}

//Implements the Minimax algorithm with Alpha-Beta pruning to evaluate the best move for the current player
function minimax(board, depth, alpha, beta, maximizingPlayer) {
  if (depth === 0 || checkWin(1) || checkWin(2)) {
    return { score: evaluateBoard() };
  }

  // Initialize the best move, setting the score based on whether we're maximizing or minimizing
  let bestMove = { score: maximizingPlayer ? -Infinity : Infinity, col: null };

  //Try every possible columns
  for (let col = 0; col < COLS; col++) {
    const row = getNextEmptyRow(board, col);
    if (row !== -1) {
      board[row][col] = maximizingPlayer ? 2 : 1;
      // Recursively call Minimax to evaluate the new board state
      const { score } = minimax(board, depth - 1, alpha, beta, !maximizingPlayer);
      board[row][col] = 0;

      // Update the best move and alpha-beta values based on the current player's turn.
      if (maximizingPlayer) {
        if (score > bestMove.score) bestMove = { score, col };
        alpha = Math.max(alpha, score);
      } else {
        if (score < bestMove.score) bestMove = { score, col };
        beta = Math.min(beta, score);
      }

      //If the current branch is worse than a previously explored one, stop exploring it
      if (beta <= alpha) break;
    }
  }

  return bestMove;
}

//Finds the next available row in the given columns
//by starting from the bottom of the board and checks upwards
function getNextEmptyRow(board, col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row;
  }
  return -1;
}

//Evaluates the entire game board and returns a total score
//by assessing the occupied position for each player
function evaluateBoard() {
  let score = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== 0) {
        score += evaluatePosition(r, c, board[r][c]);
      }
    }
  }
  return score;
}

//Evaluates the advantage for a player by scores in four directions
function evaluatePosition(row, col, player) {
  let score = 0;
  score += countConsecutive(row, col, 1, 0, player); //Vertical
  score += countConsecutive(row, col, 0, 1, player); //Horizontal
  score += countConsecutive(row, col, 1, 1, player); //Diagonal-Right
  score += countConsecutive(row, col, 1, -1, player); //Diagonal-Left
  return player === 2 ? score : -score;
}

//Evsluates a consecutive streak of disk for a player in a specified direction
function countConsecutive(row, col, rowDir, colDir, player) {
  let consecutive = 0;
  let openEnds = 0;

//Checks up to 4 positions in the given direction
  for (let i = 0; i < 4; i++) {
    const r = row + i * rowDir;
    const c = col + i * colDir;

    //Stops if the position is out of bounds
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) break;
    if (board[r][c] === player) consecutive++;
    else if (board[r][c] === 0) openEnds++;
    else break;
  }

  //Assign scores based on streak length and open ends
  let score = 0;
  if (consecutive === 4) score += 1000;
  else if (consecutive === 3 && openEnds > 0) score += 100;
  else if (consecutive === 2 && openEnds > 0) score += 10;

  return score;
}

function disableBoard() {
  document.querySelectorAll('.cell').forEach(cell => cell.removeEventListener('click', handleMove));
}
