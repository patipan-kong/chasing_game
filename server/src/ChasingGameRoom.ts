import { Room, Client } from "colyseus";
import { GameState, Player } from "./schema/GameState";
import * as gameData from "../game_data.json";

export class ChasingGameRoom extends Room<GameState> {
  maxClients = 8;
  private gameInterval?: NodeJS.Timeout;
  private waitingInterval?: NodeJS.Timeout;
  private aiPlayers: string[] = [];

  onCreate(options: any) {
    this.setState(new GameState());
    this.state.gamePhase = "waiting";
    this.state.waitingTimer = gameData.lobbyWaitingTime;
    this.state.gameTimer = gameData.gamePlayTime;
    
    console.log("ChasingGameRoom created!");

    // Handle player movement
    this.onMessage("move", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || player.isCaught || this.state.gamePhase !== "playing") return;

      const { direction } = message;
      let newX = player.x;
      let newY = player.y;

      switch (direction) {
        case "up":
          newY = Math.max(0, player.y - 1);
          break;
        case "down":
          newY = Math.min(this.state.boardSize - 1, player.y + 1);
          break;
        case "left":
          newX = Math.max(0, player.x - 1);
          break;
        case "right":
          newX = Math.min(this.state.boardSize - 1, player.x + 1);
          break;
      }

      // Check if position is occupied
      const occupied = Array.from(this.state.players.values()).some(
        p => p.sessionId !== player.sessionId && p.x === newX && p.y === newY && !p.isCaught
      );

      if (!occupied) {
        player.x = newX;
        player.y = newY;

        // Check for catches if player is giant
        if (player.isGiant) {
          this.checkCatches(player);
        }
      }
    });

    // Start waiting timer
    this.startWaitingTimer();
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const { name, characterId } = options;
    const player = new Player(client.sessionId, name, characterId, false);
    this.state.players.set(client.sessionId, player);

    // If we have enough players and still waiting, reduce waiting time
    if (this.state.players.size >= 2 && this.state.gamePhase === "waiting") {
      this.state.waitingTimer = Math.min(this.state.waitingTimer, 10);
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    
    const player = this.state.players.get(client.sessionId);
    if (player && !player.isAI) {
      this.state.players.delete(client.sessionId);
    }

    // End game if no real players left
    const realPlayers = Array.from(this.state.players.values()).filter(p => !p.isAI);
    if (realPlayers.length === 0 && this.state.gamePhase === "playing") {
      this.endGame();
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    if (this.gameInterval) clearInterval(this.gameInterval);
    if (this.waitingInterval) clearInterval(this.waitingInterval);
  }

  private startWaitingTimer() {
    this.waitingInterval = setInterval(() => {
      this.state.waitingTimer--;

      if (this.state.waitingTimer <= 0) {
        this.startGame();
      }
    }, 1000);
  }

  private startGame() {
    if (this.waitingInterval) {
      clearInterval(this.waitingInterval);
      this.waitingInterval = undefined;
    }

    // Add AI players if needed (minimum 3 total players)
    const currentPlayers = this.state.players.size;
    const minPlayers = 3;
    
    if (currentPlayers < minPlayers) {
      const aiNeeded = minPlayers - currentPlayers;
      const aiCharacters = [0, 1, 2, 3, 4, 5, 6, 7];
      const usedCharacters = Array.from(this.state.players.values()).map(p => p.characterId);
      const availableCharacters = aiCharacters.filter(c => !usedCharacters.includes(c));

      for (let i = 0; i < aiNeeded; i++) {
        const aiId = `ai_${Date.now()}_${i}`;
        const characterId = availableCharacters[i % availableCharacters.length];
        const aiPlayer = new Player(aiId, `AI-${i + 1}`, characterId, true);
        this.state.players.set(aiId, aiPlayer);
        this.aiPlayers.push(aiId);
      }
    }

    // Assign random positions
    this.assignRandomPositions();

    // Select random giant
    const playerIds = Array.from(this.state.players.keys());
    const giantId = playerIds[Math.floor(Math.random() * playerIds.length)];
    this.state.players.get(giantId)!.isGiant = true;

    this.state.gamePhase = "playing";
    this.state.gameTimer = gameData.gamePlayTime;

    // Start game timer
    this.gameInterval = setInterval(() => {
      this.state.gameTimer--;

      // AI movement
      this.moveAIPlayers();

      if (this.state.gameTimer <= 0) {
        this.endGame("players");
      }

      // Check win conditions
      this.checkWinConditions();
    }, 1000);
  }

  private assignRandomPositions() {
    const positions: Set<string> = new Set();
    
    this.state.players.forEach((player) => {
      let x: number, y: number, posKey: string;
      
      do {
        x = Math.floor(Math.random() * this.state.boardSize);
        y = Math.floor(Math.random() * this.state.boardSize);
        posKey = `${x},${y}`;
      } while (positions.has(posKey));
      
      positions.add(posKey);
      player.x = x;
      player.y = y;
    });
  }

  private moveAIPlayers() {
    this.aiPlayers.forEach(aiId => {
      const aiPlayer = this.state.players.get(aiId);
      if (!aiPlayer || aiPlayer.isCaught) return;

      if (aiPlayer.isGiant) {
        // AI Giant: chase nearest player
        this.moveAIGiant(aiPlayer);
      } else {
        // AI Player: run from giant
        this.moveAIRunner(aiPlayer);
      }
    });
  }

  private moveAIGiant(giant: Player) {
    // Find nearest uncaught player
    let nearestPlayer: Player | undefined = undefined;
    let minDistance = Infinity;

    this.state.players.forEach(player => {
      if (player.sessionId !== giant.sessionId && !player.isCaught) {
        const distance = Math.abs(player.x - giant.x) + Math.abs(player.y - giant.y);
        if (distance < minDistance) {
          minDistance = distance;
          nearestPlayer = player;
        }
      }
    });

    if (nearestPlayer) {
      const dx = nearestPlayer.x - giant.x;
      const dy = nearestPlayer.y - giant.y;

      let newX = giant.x;
      let newY = giant.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        newX = giant.x + (dx > 0 ? 1 : -1);
      } else if (dy !== 0) {
        newY = giant.y + (dy > 0 ? 1 : -1);
      }

      newX = Math.max(0, Math.min(this.state.boardSize - 1, newX));
      newY = Math.max(0, Math.min(this.state.boardSize - 1, newY));

      const occupied = Array.from(this.state.players.values()).some(
        p => p.sessionId !== giant.sessionId && p.x === newX && p.y === newY && !p.isCaught
      );

      if (!occupied) {
        giant.x = newX;
        giant.y = newY;
        this.checkCatches(giant);
      }
    }
  }

  private moveAIRunner(runner: Player) {
    // Find giant
    const giant = Array.from(this.state.players.values()).find(p => p.isGiant);
    if (!giant) return;

    const dx = runner.x - giant.x;
    const dy = runner.y - giant.y;

    let newX = runner.x;
    let newY = runner.y;

    // Move away from giant
    if (Math.abs(dx) > Math.abs(dy)) {
      newX = runner.x + (dx > 0 ? 1 : -1);
    } else if (dy !== 0) {
      newY = runner.y + (dy > 0 ? 1 : -1);
    } else {
      // Random move if same position
      const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      newX = runner.x + dir[0];
      newY = runner.y + dir[1];
    }

    newX = Math.max(0, Math.min(this.state.boardSize - 1, newX));
    newY = Math.max(0, Math.min(this.state.boardSize - 1, newY));

    const occupied = Array.from(this.state.players.values()).some(
      p => p.sessionId !== runner.sessionId && p.x === newX && p.y === newY && !p.isCaught
    );

    if (!occupied) {
      runner.x = newX;
      runner.y = newY;
    }
  }

  private checkCatches(giant: Player) {
    this.state.players.forEach(player => {
      if (!player.isGiant && !player.isCaught && 
          player.x === giant.x && player.y === giant.y) {
        player.isCaught = true;
      }
    });
  }

  private checkWinConditions() {
    const activePlayers = Array.from(this.state.players.values()).filter(
      p => !p.isGiant && !p.isCaught
    );

    if (activePlayers.length === 0) {
      this.endGame("giant");
    }
  }

  private endGame(winner?: string) {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = undefined;
    }

    this.state.gamePhase = "ended";
    this.state.winner = winner || (this.state.gameTimer <= 0 ? "players" : "giant");

    // Auto-disconnect after 10 seconds
    setTimeout(() => {
      this.disconnect();
    }, 10000);
  }
}
