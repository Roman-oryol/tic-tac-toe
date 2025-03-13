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

  function determineFirstPlayer(playerId) {
    currentPlayer = playerId === 'x' ? playerX : playerO;
  }

  function switchPlayerTurn() {
    currentPlayer = currentPlayer.id === 'x' ? playerO : playerX;
    screenController.toggleCurrentTurn(currentPlayer.id);
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
      screenController.showPlayerSelection();
    }

    if (isDraw(gameboard.getState())) {
      screenController.showModal(isDraw(gameboard.getState()));
      resetRound();
      screenController.showPlayerSelection();
    }
  }

  function getCurrentPlayer() {
    return { ...currentPlayer };
  }

  // function init() {
  //   currentPlayer = playerX;
  // }

  return {
    // init,
    handleMove,
    getCurrentPlayer,
    resetGame,
    determineFirstPlayer,
  };
})();

const screenController = (function () {
  let gameboard;
  let boardCells;
  let modal;
  let modalTextEl;
  let scoreXEl;
  let scoreOEl;
  let resetBtn;
  let selectPlayerButtons;
  let playerSelectionEl;
  let currentPlayerEl;

  function casheDom() {
    gameboard = document.querySelector('.game-board');
    boardCells = gameboard.querySelectorAll('.cell');
    modal = document.querySelector('dialog');
    modalTextEl = modal.querySelector('.dialog-text');
    scoreXEl = document.querySelector('.score-x');
    scoreOEl = document.querySelector('.score-o');
    resetBtn = document.querySelector('.reset-btn');
    playerSelectionEl = document.querySelector('.player-selection');
    selectPlayerButtons = playerSelectionEl.querySelectorAll('.select-player');
    currentPlayerEl = document.querySelector('.current-turn .player');
  }

  function bindEvents() {
    boardCells.forEach((cell) => {
      cell.addEventListener('click', (e) => {
        gameController.handleMove(Number(e.target.dataset.index));
      });
    });

    resetBtn.addEventListener('click', gameController.resetGame);

    selectPlayerButtons.forEach((button) => {
      button.addEventListener('click', handleSelectPlayer);
    });
  }

  function toggleCurrentTurn(currentPlayerId) {
    currentPlayerEl.textContent = currentPlayerId;
    currentPlayerEl.classList.toggle('player-x');
    currentPlayerEl.classList.toggle('player-o');
    // currentPlayerEl.classList.toggle(
    //   `player-${currentPlayerId === 'x' ? 'x' : 'o'}`
    // );
  }

  function handleSelectPlayer(e) {
    const selectedPlayerId = e.currentTarget.dataset.player;
    gameController.determineFirstPlayer(selectedPlayerId);
    playerSelectionEl.classList.add('fade-out');

    playerSelectionEl.addEventListener('animationend', () => {
      playerSelectionEl.classList.add('hidden');
      gameboard.classList.remove('hidden');
      gameboard.classList.add('fade-in');
    });

    currentPlayerEl.textContent = selectedPlayerId;
    currentPlayerEl.classList.add(
      `player-${selectedPlayerId === 'x' ? 'x' : 'o'}`
    );
  }

  function showPlayerSelection() {
    gameboard.classList.add('hidden');
    gameboard.classList.remove('fade-in');
    playerSelectionEl.classList.remove('hidden');
    playerSelectionEl.classList.remove('fade-out');
    currentPlayerEl.className = 'player';
    currentPlayerEl.textContent = '';
  }

  function showModal(result) {
    let message;
    if (typeof result === 'object') {
      message = `Игрок <span class="player-${
        result.id
      }">${result.id.toUpperCase()}</span> победил! Поздравляем!`;
    } else {
      message = 'Игра окончена! Ничья.';
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
    showPlayerSelection,
    toggleCurrentTurn,
  };
})();

// gameController.init();
screenController.init();
