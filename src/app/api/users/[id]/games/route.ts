import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "L'ID utilisateur doit être un nombre." },
        { status: 400 }
      );
    }

    // Récupérer les games auquel l'utilisateur a joué via les GameInfos
    const games = await prisma.gameInfos.findMany({
      where: { userId },
      include: {
        game: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (games.length === 0) {
      return NextResponse.json(
        { message: "Aucune partie trouvée pour cet utilisateur.", games: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(games, { status: 200 });
  } catch (error) {
    console.error("Erreur API /api/users/[id]/games:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
