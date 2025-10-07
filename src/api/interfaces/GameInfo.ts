import {Game} from "@/api/interfaces/Game";
import {User} from "@/api/interfaces/User";

export class GameInfo {
    id: number;
    score: number;
    result: number;
    game: Game;
    user: User
    createdAt: Date;

    constructor(id: number, score: number, result: number, game: Game, user: User, createdAt: Date) {
        this.id = id;
        this.score = score;
        this.result = result;
        this.game = game;
        this.user = user;
        this.createdAt = createdAt;
    }
}