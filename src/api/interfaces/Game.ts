enum GameStateEnum {
    WAITING_FOR_PLAYERS = 'WAITING_FOR_PLAYERS',
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

export class Game{
    id: number;
    gameState: GameStateEnum = GameStateEnum.WAITING_FOR_PLAYERS;
    createdAt: Date;

    constructor(id: number, gameState: GameStateEnum, createdAt: Date) {
        this.id = id;
        this.gameState = gameState;
        this.createdAt = createdAt;
    }
}