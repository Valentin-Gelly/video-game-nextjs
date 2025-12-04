import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const gameId = params.gameId;

    if (!gameId) {
      return NextResponse.json(
        { error: "L'ID de la partie est requis." },
        { status: 400 }
      );
    }

    // Récupérer TOUTES les GameInfos pour cette partie (tous les joueurs)
    const gameInfos = await prisma.gameInfos.findMany({
      where: { gameId },
      include: {
        game: true,
        user: true,
      },
      orderBy: {
        score: "desc", // Trié par score décroissant (classement)
      },
    });

    if (gameInfos.length === 0) {
      return NextResponse.json(
        { error: "Partie non trouvée." },
        { status: 404 }
      );
    }

    // Ajouter le classement (ranking) à chaque joueur
    const gameWithRanking = {
      game: gameInfos[0].game,
      players: gameInfos.map((info, index) => ({
        ...info,
        rank: index + 1, // 1ère place, 2ème place, etc.
      })),
    };

    return NextResponse.json(gameWithRanking, { status: 200 });
  } catch (error) {
    console.error("Erreur API /api/games/[gameId]:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
