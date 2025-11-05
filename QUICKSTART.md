# Chasing Game - Quick Start Guide

## 🎮 Project Structure

```
chasing_game/
├── server/              # Colyseus game server (TypeScript)
│   ├── src/
│   │   ├── index.ts            # Server entry point
│   │   ├── ChasingGameRoom.ts  # Game room logic
│   │   └── schema/
│   │       └── GameState.ts    # Game state schema
│   ├── package.json
│   └── tsconfig.json
├── client/              # HTML5 game client
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Game styles
│   ├── game.js         # Game client logic
│   ├── characters.json # Character data
│   └── package.json
├── install.bat         # Windows installation script
├── install.sh          # Mac/Linux installation script
├── start-server.bat    # Windows server start script
├── start-server.sh     # Mac/Linux server start script
├── start-client.bat    # Windows client start script
├── start-client.sh     # Mac/Linux client start script
└── README.md           # Project documentation
```

## 🚀 Getting Started

### Step 1: Install Dependencies

**On Windows:**
```bash
install.bat
```

**On Mac/Linux:**
```bash
chmod +x install.sh && ./install.sh
```

This will install all required dependencies for both server and client.

### Step 2: Start the Server

**On Windows:**
```bash
start-server.bat
```

**On Mac/Linux:**
```bash
chmod +x start-server.sh && ./start-server.sh
```

The server will start on `http://localhost:2567`

### Step 3: Start the Client

Open a **NEW terminal window** and run:

**On Windows:**
```bash
start-client.bat
```

**On Mac/Linux:**
```bash
chmod +x start-client.sh && ./start-client.sh
```

The client will start on `http://localhost:3000` and should open automatically in your browser.

## 🎯 How to Play

1. **Choose Your Character** - Select from 8 unique characters
2. **Enter Your Name** - Personalize your player
3. **Wait for Players** - The game waits up to 30 seconds for other players
4. **Auto-Start with AI** - If not enough players join, AI players will be added
5. **Play the Game**:
   - One player/AI is randomly chosen as the **Giant (Catcher)**
   - Other players must **survive** until time runs out
   - Giant must **catch all players** before time runs out
6. **Move Around** - Use arrow buttons or keyboard (↑↓←→ or WASD)

## 🏆 Winning Conditions

- **Players Win**: At least one player survives when time runs out (180 seconds / 3 minutes)
- **Giant Wins**: All players are caught before time runs out

## 🎨 Characters

1. 🛡️ Knight
2. 🧙 Wizard
3. 🥷 Ninja
4. 🏴‍☠️ Pirate
5. 🤖 Robot
6. 👽 Alien
7. 👸 Princess
8. 🐉 Dragon

## 🔧 Configuration

### Game Settings (server/game_data.json)

You can easily configure game timings by editing the `server/game_data.json` file:

```json
{
    "lobbyWaitingTime": 30,     // Seconds to wait for players before starting
    "gamePlayTime": 180          // Game duration in seconds (3 minutes)
}
```

After changing this file, restart the server for changes to take effect.

### Change Server URL (in client/game.js)

To use your local server instead of the demo server:

```javascript
// Change from:
const url = `https://chasing-game-serv.onrender.com`;

// To:
const currentHostname = location.hostname;
const url = `ws://${currentHostname}:2567`;
```

### Advanced Settings (in server code)

For more advanced configurations, you can modify these files:

**server/src/schema/GameState.ts:**
- **Board Size**: 8×8 grid (change `boardSize` property)

**server/src/ChasingGameRoom.ts:**
- **Max Players**: 8 players (change `maxClients` property)
- **Minimum Players**: Minimum players before adding AI (currently 3)

## 🛠️ Development

### Server Development

```bash
cd server
npm start  # Starts with hot-reload
```

### Build Server for Production

```bash
cd server
npm run build
npm run serve
```

### Client Development

The client uses vanilla JavaScript and doesn't require a build step. Just edit the files and refresh your browser.

## 📦 Technologies Used

### Server
- **Colyseus** - Multiplayer game server framework
- **Node.js** - Runtime environment
- **Express** - Web server
- **TypeScript** - Type-safe JavaScript

### Client
- **Colyseus.js** - Client library for Colyseus
- **HTML5/CSS3** - UI and styling
- **Vanilla JavaScript** - Game logic
- **http-server** - Static file server

## 🐛 Troubleshooting

### Port Already in Use

If you get an error that port 2567 or 3000 is already in use:

**Kill the process on Windows:**
```bash
netstat -ano | findstr :2567
taskkill /PID <PID> /F
```

**Kill the process on Mac/Linux:**
```bash
lsof -i :2567
kill -9 <PID>
```

### Cannot Connect to Server

1. Make sure the server is running first
2. Check that you're using the correct server URL in `client/game.js`
3. Ensure no firewall is blocking the connection

### AI Players Not Moving

This is expected behavior - AI players use simple logic and may get stuck. They will try to:
- **AI Giant**: Chase the nearest player
- **AI Runner**: Run away from the giant

## 📝 License

MIT License - Feel free to modify and distribute!

## 🎉 Enjoy the Game!

Have fun playing the Chasing Game! Report any issues or contribute improvements to make it even better!
