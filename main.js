const gameboard = (function () {
  let state = Array(9).fill(null);

  function updateState(index, playerId) {
    state[index] = playerId;
  }

  function getState() {
    return [...state];
  }

  function clearState() {
    state = Array(9).fill(null);
  }

  return {
    getState,
    updateState,
    clearState,
  };
})();

const player = function (id) {
  let moves = [];
  let score = 0;

  function makeMove(index) {
    gameboard.updateState(index, id);
    moves.push(index);
  }

  function incrementScore() {
    score++;
  }

  function getScore() {
    return score;
  }

  function getMoves() {
    return [...moves];
  }

  function clearMoves() {
    moves = [];
  }

  function resetScore() {
    score = 0;
  }

  return {
    id,
    makeMove,
    getMoves,
    incrementScore,
    getScore,
    clearMoves,
    resetScore,
  };
};

const gameController = (function () {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  const playerX = player('x');
  const playerO = player('o');
  let currentPlayer;

  function switchPlayerTurn() {
    currentPlayer = currentPlayer.id === 'x' ? playerO : playerX;
  }

  function handleMove(index) {
    currentPlayer.makeMove(index);
    screenController.updateBoard(index, currentPlayer);
    if (isGameEnd()) {
      handleGameEnd();
      return;
    }

    switchPlayerTurn();
  }

  function checkWinner(moves) {
    let hasWinner = winningCombinations.some((combination) =>
      combination.every((item) => moves.includes(item))
    );

    if (hasWinner) {
      return currentPlayer;
    }

    return null;
  }

  function isDraw(state) {
    return state.every((cell) => cell !== null);
  }

  function isGameEnd() {
    return (
      checkWinner(currentPlayer.getMoves()) || isDraw(gameboard.getState())
    );
  }

  function resetRound() {
    playerX.clearMoves();
    playerO.clearMoves();
    screenController.clearBoard();
    gameboard.clearState();
  }

  function resetGame() {
    resetRound();
    playerX.resetScore();
    playerO.resetScore();
    screenController.clearScores();
  }

  function handleGameEnd() {
    const winner = checkWinner(currentPlayer.getMoves());

    if (winner) {
      screenController.showModal(winner);
      currentPlayer.incrementScore();
      screenController.updateScore(winner, currentPlayer.getScore());
      resetRound();
    }

    if (isDraw(gameboard.getState())) {
      screenController.showModal(isDraw(gameboard.getState()));
      resetRound();
    }
  }

  function getCurrentPlayer() {
    return { ...currentPlayer };
  }

  function init() {
    currentPlayer = playerX;
  }

  return {
    init,
    handleMove,
    getCurrentPlayer,
    resetGame,
  };
})();

const screenController = (function () {
  let boardCells;
  let modal;
  let modalTextEl;
  let scoreXEl;
  let scoreOEl;
  let resetBtn;

  function casheDom() {
    boardCells = document.querySelectorAll('.cell');
    modal = document.querySelector('dialog');
    modalTextEl = modal.querySelector('.dialog-text');
    scoreXEl = document.querySelector('.score-x');
    scoreOEl = document.querySelector('.score-o');
    resetBtn = document.querySelector('.reset-btn');
  }

  function bindEvents() {
    boardCells.forEach((cell) => {
      cell.addEventListener('click', (e) => {
        gameController.handleMove(Number(e.target.dataset.index));
      });
    });

    resetBtn.addEventListener('click', gameController.resetGame);
  }

  function showModal(result) {
    let message;
    if (typeof result === 'object') {
      message = `Player <span class="player-${
        result.id
      }">${result.id.toUpperCase()}</span> wins! Congratulations!`;
    } else {
      message = "It's a draw!";
    }
    modalTextEl.innerHTML = message;
    modal.showModal();
  }

  function updateBoard(index, currentPlayer) {
    const cell = boardCells[index];
    cell.classList.add(currentPlayer.id === 'x' ? 'cell-x' : 'cell-o');
    cell.disabled = true;
  }

  function updateScore(winner, score) {
    if (winner.id === 'x') {
      scoreXEl.textContent = score;
    } else {
      scoreOEl.textContent = score;
    }
  }

  function clearBoard() {
    boardCells.forEach((cell) => {
      cell.classList.remove('cell-x', 'cell-o');
      cell.disabled = false;
    });
  }

  function clearScores() {
    scoreXEl.textContent = 0;
    scoreOEl.textContent = 0;
  }

  function init() {
    casheDom();
    bindEvents();
  }

  return {
    init,
    updateBoard,
    showModal,
    updateScore,
    clearBoard,
    clearScores,
  };
})();

gameController.init();
screenController.init();
