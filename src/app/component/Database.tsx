import { Game } from "@/server/gameManager";
import { PrismaClient } from "../../generated/prisma";

export async function saveGame(gameData: Game) {
    const prisma = new PrismaClient();
    if (!gameData.ranking) {
        throw new Error("Données de la partie manquantes");
    }
    console.log("Sauvegarde de la partie dans la BDD :", gameData);
    const game = await prisma.game.create({
        data: {
            id: gameData.id,
            gameCode: gameData.code,
            gameName: gameData.name,
            description: gameData.description,
            status: gameData.state,
            createdAt: new Date(gameData.createdAt),
            createdById: Number(gameData.createdBy),

            // joueurs : uniquement si ce sont des Users existants !
            players: {
                connect: gameData.players.map(p => ({
                    id: Number(p.idUser) // ou autre conversion si besoin
                }))
            },

            // classement (GameInfos)
            infos: {
                create: gameData.ranking.map((r, index) => ({
                    user: { connect: { id: Number(r.id) } }, // si id User existe
                    score: r.points,
                    position: index + 1
                }))
            }
        }
    });

    return game;
}
