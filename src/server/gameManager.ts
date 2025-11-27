import { v4 as uuid } from "uuid";

type PlayerId = string;

export interface Player {
  id: PlayerId;
  name: string;
  gold: number;
  hand: Building[];
  city: Building[];
  role?: Role;
  isAlive?: boolean;
  isCreator?: boolean;
}
export interface GameState {
  id: string;
  players: Player[];
  deck: Building[];
  discard: Building[];
  phase: string;
  currentPlayerId?: PlayerId;
  currentRole?: Role;
  rolesOrder?: string[];
  rolesPool: Role[];
  gameStep: "roleSelection" | "playerTurn";
  crownHolderId?: PlayerId;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  order: number;
  color: string;
}

export interface Building {
  id: string;
  name: string;
  cost: number;
  color: string;
  description?: string;
}

export interface Game {
  id: string;
  code: string;
  name: string;
  description?: string;
  players: Player[];
  deck: Building[];
  roles: Role[];
  state: "WAITING" | "IN_PROGRESS" | "FINISHED";
  createdAt: Date;
  createdBy: string;
}

class GameManager {
  private games: Map<string, Game> = new Map();

  createGame(name: string, description: string, createdBy: string): Game {
    const game: Game = {
      id: uuid(),
      code: Math.random().toString(36).substring(2, 8),
      name,
      description,
      players: [],
      deck: [],
      roles: [],
      state: "WAITING",
      createdAt: new Date(),
      createdBy: createdBy,
    };
    this.games.set(game.id, game);
    return game;
  }

  getGameById(id: string) {
    return this.games.get(id);
  }

  getGameByCode(code: string) {
    return Array.from(this.games.values()).find((g) => g.code === code);
  }

  getAllGames() {
    return Array.from(this.games.values());
  }

  addPlayer(gameId: string, player: Player) {
    const game = this.games.get(gameId);
    if (game) {
      game.players.push(player);
    }
  }

  removeGame(gameId: string) {
    this.games.delete(gameId);
  }

  endGame(gameId: string) {
    const game = this.games.get(gameId);
    if (game) {
      game.state = "FINISHED";
      return game;
    }
    return null;
  }
}

export const gameManager = new GameManager();
