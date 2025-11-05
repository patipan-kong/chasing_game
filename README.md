# Chasing Game
A multiplayer Chasing game built with Colyseus and HTML5

## Play Demo 
- https://chasing-game.onrender.com

## 🌟 Features
- **Character Selection**: Choose from 8 unique characters 
- **Multiple Game Modes**: 
  - Multiplayer mode for up to 8 players
  - Auto Join existing games and wait for other player to join in 60 seconds, if no one join , game will be start and play will ai player
- **Interactive Tutorial**: Built-in "How to Play" guide
- **Real-time Gameplay**: 
  - Game will random assign one player or AI to be catcher (Giant)
  - Real time move with direction button for bother Giant and other player
  - board size will be 8*8
  - Player will random start point and cannot be the same co-ordinate
  - If player be catch from giant, player will lose, but if player survive until time up, player will win
  - If Giant catch all player before time up, giant will win.  
- **Responsive Design**: Works on desktop and mobile devices

## 🌟 Technology Stack

### Frontend
- **Colyseus.js**: Real-time multiplayer client for seamless networking
- **HTML5/CSS3**: Responsive design with modern UI/UX
- **JavaScript (ES6+)**: Modern vanilla JavaScript with async/await

### Backend  
- **Colyseus**: Authoritative multiplayer game server
- **Node.js**: Server runtime environment
- **Express**: Web server framework
- **@colyseus/schema**: State synchronization

### Data Management
- **JSON Configuration**: Character data and game settings
- **Real-time State**: Synchronized game state across all clients

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+ recommended)
- npm or yarn

### Installation

1. **Clone or download the repository**
2. **Run the installation script:**
   ```bash
   # On Windows
   install.bat
   
   # On Mac/Linux
   chmod +x install.sh && ./install.sh
   ```

### Running the Game

1. **Start the server:**
   ```bash
   # On Windows
   start-server.bat
   
   # On Mac/Linux  
   cd server && npm start
   ```

2. **Start the client (in a new terminal):**
   ```bash
   # On Windows
   start-client.bat
   
   # On Mac/Linux
   cd client && npm start
   ```

3. **Open your browser and go to:**
   ```
   http://localhost:3000
   ```
4. **Change server url, If want to use your own server**
   ```
   from
   // const currentHostname = location.hostname;
   // const url = `ws://${currentHostname}:2567`;        
   const url = `https://chasing-game-serv.onrender.com`;
   to
   const currentHostname = location.hostname;
   const url = `ws://${currentHostname}:2567`;        
   // const url = `https://chasing-game-serv.onrender.com`;
   ```
## 🎮 How to Play

### Game Setup
1. Choose your character from 8 available options
2. Auto join room and wating other player for 30 seconds. If no anyone join room, game will be start with ai player

### Gameplay
- Players (and AI) will random pick one as giant role for chasing other player
- Player must survive until time up for win.
- Giant (Chaser) must cacth all player before time up for win.
- Game settings are configurable via `server/game_data.json`:
  - `lobbyWaitingTime`: Time to wait for players (default: 30 seconds)
  - `gamePlayTime`: Game duration (default: 180 seconds / 3 minutes)

### Multiplayer Features
- Up to 8 players can play together
- auto join room within 30 seconds
- Real-time synchronization of all game actions

## 🎯 Game Rules
1. **Objective**: Player must survive until time up for win, Giant (Chaser) must cacth all player before time up for win.
2. **Action**: move using direction button
3. **Turn Order**: Players alternate turns automatically  
4. **Winning**: Player must survive until time up for win, Giant (Chaser) must cacth all player before time up for win.

## 📝 License

MIT License - Feel free to modify and distribute!
