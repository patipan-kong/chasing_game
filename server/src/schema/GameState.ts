import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") sessionId: string;
  @type("string") name: string;
  @type("number") characterId: number;
  @type("number") x: number;
  @type("number") y: number;
  @type("boolean") isGiant: boolean;
  @type("boolean") isCaught: boolean;
  @type("boolean") isAI: boolean;

  constructor(sessionId: string, name: string, characterId: number, isAI: boolean = false) {
    super();
    this.sessionId = sessionId;
    this.name = name;
    this.characterId = characterId;
    this.x = 0;
    this.y = 0;
    this.isGiant = false;
    this.isCaught = false;
    this.isAI = isAI;
  }
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("number") boardSize: number = 8;
  @type("number") gameTimer: number = 180; // Updated from game_data.json
  @type("string") gamePhase: string = "waiting"; // waiting, playing, ended
  @type("string") winner: string = ""; // "players", "giant", ""
  @type("number") waitingTimer: number = 30; // Updated from game_data.json
}
