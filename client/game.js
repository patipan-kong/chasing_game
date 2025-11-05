// Game client for Chasing Game
let client;
let room;
let characters = [];
let selectedCharacter = null;
let mySessionId = null;

// Server configuration
// const currentHostname = location.hostname;
// const url = `ws://${currentHostname}:2567`;
const url = `https://chasing-game-serv.onrender.com`;

// Load characters
async function loadCharacters() {
    try {
        const response = await fetch('characters.json');
        characters = await response.json();
        displayCharacters();
    } catch (error) {
        console.error('Error loading characters:', error);
    }
}

function displayCharacters() {
    const grid = document.getElementById('character-grid');
    grid.innerHTML = '';
    
    characters.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <div class="character-emoji">${char.emoji}</div>
            <div class="character-name">${char.name}</div>
        `;
        card.onclick = () => selectCharacter(char, card);
        grid.appendChild(card);
    });
}

function selectCharacter(char, cardElement) {
    // Remove previous selection
    document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
    
    // Select new character
    cardElement.classList.add('selected');
    selectedCharacter = char;
    
    // Auto-join game
    setTimeout(() => joinGame(), 500);
}

async function joinGame() {
    const playerName = document.getElementById('player-name').value.trim() || 'Player';
    
    if (!selectedCharacter) {
        alert('Please select a character!');
        return;
    }

    try {
        client = new Colyseus.Client(url);
        
        // Try to join or create room
        room = await client.joinOrCreate("chasing_game", {
            name: playerName,
            characterId: selectedCharacter.id
        });

        mySessionId = room.sessionId;
        
        setupRoomListeners();
        showScreen('waiting-screen');
        
    } catch (error) {
        console.error('Error joining game:', error);
        alert('Failed to connect to server. Please try again.');
    }
}

function setupRoomListeners() {
    // Listen for state changes
    room.state.players.onAdd((player, sessionId) => {
        console.log(`Player ${player.name} joined`);
        updateWaitingRoom();
    });

    room.state.players.onRemove((player, sessionId) => {
        console.log(`Player ${player.name} left`);
        updateWaitingRoom();
    });

    room.state.onChange(() => {
        updateGameState();
    });

    // Listen for player changes
    room.state.players.onChange((player, sessionId) => {
        updateGameBoard();
    });
}

function updateWaitingRoom() {
    const playersDiv = document.getElementById('waiting-players');
    playersDiv.innerHTML = '';
    
    room.state.players.forEach((player, sessionId) => {
        const char = characters[player.characterId];
        const playerDiv = document.createElement('div');
        playerDiv.className = 'waiting-player';
        playerDiv.innerHTML = `
            <div class="waiting-player-emoji">${char.emoji}</div>
            <div class="waiting-player-name">${player.name}</div>
            ${player.isAI ? '<span class="ai-badge">AI</span>' : ''}
        `;
        playersDiv.appendChild(playerDiv);
    });
}

function updateGameState() {
    // Update waiting timer
    if (room.state.gamePhase === 'waiting') {
        document.getElementById('waiting-timer').textContent = room.state.waitingTimer;
    }
    
    // Start game
    if (room.state.gamePhase === 'playing' && document.getElementById('game-screen').style.display !== 'block') {
        startGame();
    }
    
    // Update game timer
    if (room.state.gamePhase === 'playing') {
        document.getElementById('game-timer').textContent = room.state.gameTimer;
    }
    
    // End game
    if (room.state.gamePhase === 'ended') {
        endGame();
    }
}

function startGame() {
    showScreen('game-screen');
    initGameBoard();
    updateRoleInfo();
    updateGameBoard();
}

function initGameBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    for (let y = 0; y < room.state.boardSize; y++) {
        for (let x = 0; x < room.state.boardSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            board.appendChild(cell);
        }
    }
}

function updateRoleInfo() {
    const myPlayer = room.state.players.get(mySessionId);
    const roleDiv = document.getElementById('role-info');
    
    if (myPlayer.isGiant) {
        roleDiv.textContent = '👹 Your Role: GIANT (Catcher)';
        roleDiv.classList.add('giant');
    } else {
        roleDiv.textContent = '🏃 Your Role: Runner';
        roleDiv.classList.remove('giant');
    }
}

function updateGameBoard() {
    // Clear all cells
    document.querySelectorAll('.cell').forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('highlight');
    });
    
    // Place players
    room.state.players.forEach((player, sessionId) => {
        const cell = document.querySelector(`.cell[data-x="${player.x}"][data-y="${player.y}"]`);
        if (cell) {
            const char = characters[player.characterId];
            const sprite = document.createElement('div');
            sprite.className = 'player-sprite';
            
            if (player.isGiant) {
                sprite.classList.add('giant');
                sprite.textContent = '👹';
            } else {
                sprite.textContent = char.emoji;
            }
            
            if (player.isCaught) {
                sprite.classList.add('caught');
            }
            
            if (sessionId === mySessionId) {
                cell.classList.add('highlight');
            }
            
            cell.appendChild(sprite);
        }
    });
    
    // Update player status list
    updatePlayersList();
}

function updatePlayersList() {
    const statusDiv = document.getElementById('players-status');
    statusDiv.innerHTML = '';
    
    let activePlayers = 0;
    
    room.state.players.forEach((player, sessionId) => {
        const char = characters[player.characterId];
        const statusItem = document.createElement('div');
        statusItem.className = 'player-status';
        
        let statusBadge = '';
        if (player.isGiant) {
            statusBadge = '<span class="status-badge giant">GIANT</span>';
        } else if (player.isCaught) {
            statusBadge = '<span class="status-badge caught">CAUGHT</span>';
        } else {
            statusBadge = '<span class="status-badge safe">SAFE</span>';
            activePlayers++;
        }
        
        statusItem.innerHTML = `
            <div class="player-status-emoji">${player.isGiant ? '👹' : char.emoji}</div>
            <div class="player-status-name">${player.name}${player.isAI ? ' (AI)' : ''}</div>
            ${statusBadge}
        `;
        statusDiv.appendChild(statusItem);
    });
    
    document.getElementById('player-count').textContent = `Active Players: ${activePlayers}`;
}

function move(direction) {
    if (room && room.state.gamePhase === 'playing') {
        const myPlayer = room.state.players.get(mySessionId);
        if (myPlayer && !myPlayer.isCaught) {
            room.send('move', { direction });
        }
    }
}

function endGame() {
    showScreen('gameover-screen');
    
    const myPlayer = room.state.players.get(mySessionId);
    const resultTitle = document.getElementById('game-result');
    const resultText = document.getElementById('game-result-text');
    
    let won = false;
    
    if (room.state.winner === 'giant' && myPlayer.isGiant) {
        won = true;
        resultTitle.textContent = '🎉 Victory!';
        resultText.textContent = 'You caught all the players! Great job, Giant!';
    } else if (room.state.winner === 'players' && !myPlayer.isGiant && !myPlayer.isCaught) {
        won = true;
        resultTitle.textContent = '🎉 Victory!';
        resultText.textContent = 'You survived! Well done!';
    } else {
        resultTitle.textContent = '😢 Game Over';
        if (myPlayer.isGiant) {
            resultText.textContent = 'Players escaped! Better luck next time!';
        } else {
            resultText.textContent = 'You were caught! Try again!';
        }
    }
    
    resultTitle.className = won ? 'winner' : 'loser';
}

// Screen navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showWelcome() {
    showScreen('welcome-screen');
}

function showCharacterSelection() {
    showScreen('character-screen');
}

function showHowToPlay() {
    showScreen('howtoplay-screen');
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (room && room.state.gamePhase === 'playing') {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                move('up');
                e.preventDefault();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                move('down');
                e.preventDefault();
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                move('left');
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                move('right');
                e.preventDefault();
                break;
        }
    }
});

// Initialize
window.addEventListener('load', () => {
    loadCharacters();
});
