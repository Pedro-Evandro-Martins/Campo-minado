document.addEventListener('DOMContentLoaded', function() {
    const gridSize = localStorage.getItem('gridSize');
    const bombCount = localStorage.getItem('bombCount');
    const gameMode = localStorage.getItem('gameMode');

    // Verifica se as opções foram corretamente carregadas
    if (!gridSize || !bombCount || !gameMode) {
        alert("Configurações de jogo não encontradas. Volte à página inicial e configure o jogo.");
        window.location.href = '../pages/index.html';
        return;
    }

    // Atualiza as informações na página do jogo
    document.getElementById('bombs-count').textContent = bombCount;  // Atualiza bombCount
    document.getElementById('config').textContent = gridSize;
    document.getElementById('mode').textContent = gameMode;

    // Supondo que gridSize seja no formato "12x12"
    const [rows, cols] = gridSize.split('x').map(Number);

    // Atualiza as variáveis CSS para o número de colunas e linhas
    document.documentElement.style.setProperty('--columns', cols);
    document.documentElement.style.setProperty('--rows', rows);

    // Converte bombCount para número de minas
    const numMines = parseInt(bombCount.replace(' bombas', '').trim(), 10); // Ajuste conforme necessário

    // Cria o tabuleiro usando as configurações do usuário
    createBoard(rows, numMines);
});

function createBoard(boardSize, numMines) {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';

    // Inicializa o tabuleiro
    const board = []; // Criação do array para o tabuleiro
    for (let row = 0; row < boardSize; row++) {
        let rowArray = [];
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            // Adiciona eventos de clique ou contexto conforme necessário
            cell.addEventListener('click', function(event) {
                // Handle cell click logic here
            });
            cell.addEventListener('contextmenu', function(event) {
                // Handle right-click logic here
            });
            gameBoard.appendChild(cell);
            rowArray.push({ element: cell, mine: false, revealed: false, flagged: false, adjacentMines: 0 });
        }
        board.push(rowArray);
    }

    // Coloca as minas e calcula as minas adjacentes
    placeMines(board, boardSize, numMines);
    calculateAdjacentMines(board, boardSize);
}

function placeMines(board, boardSize, numMines) {
    let placedMines = 0;
    while (placedMines < numMines) {
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * boardSize);
        if (!board[row][col].mine) {
            board[row][col].mine = true;
            placedMines++;
        }
    }
}

function calculateAdjacentMines(board, boardSize) {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (!board[row][col].mine) {
                let adjacentMines = 0;
                for (let r = row - 1; r <= row + 1; r++) {
                    for (let c = col - 1; c <= col + 1; c++) {
                        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c].mine) {
                            adjacentMines++;
                        }
                    }
                }
                board[row][col].adjacentMines = adjacentMines;
            }
        }
    }
}

function handleCellClick(event, board, boardSize, numMines, revealedCells) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (board[row][col].revealed || board[row][col].flagged) {
        return;
    }

    revealCell(board, row, col, revealedCells);

    if (board[row][col].mine) {
        gameOver(board, boardSize, numMines);
    } else if (board[row][col].adjacentMines === 0) {
        revealAdjacentCells(board, row, col, boardSize, revealedCells);
    }

    if (revealedCells === boardSize * boardSize - numMines) {
        alert('Você venceu!');
    }
}

function handleRightClick(event, board) {
    event.preventDefault();
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (board[row][col].revealed) {
        return;
    }

    board[row][col].flagged = !board[row][col].flagged;
    board[row][col].element.classList.toggle('flag');
}

function revealCell(board, row, col, revealedCells) {
    const cell = board[row][col];
    if (cell.revealed) {
        return;
    }
    cell.revealed = true;
    revealedCells++;

    cell.element.classList.add('revealed');
    if (cell.mine) {
        cell.element.classList.add('mine');
        cell.element.textContent = '💣';
    } else if (cell.adjacentMines > 0) {
        cell.element.classList.add('number');
        cell.element.textContent = cell.adjacentMines;
    }
}

function revealAdjacentCells(board, row, col, boardSize, revealedCells) {
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && !board[r][c].mine) {
                revealCell(board, r, c, revealedCells);
            }
        }
    }
}

function gameOver(board, boardSize, numMines) {
    alert('Você perdeu!');
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col].mine) {
                revealCell(board, row, col);
            }
        }
    }
    setTimeout(function() {
        createBoard(boardSize, numMines);
    }, 1000); // Reiniciar o jogo após 1 segundo
}
