import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { verifyToken } from "@/lib/middleware";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      include: {
        players: true,
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    return NextResponse.json(games, { status: 200 });
  } catch (error) {
    console.error("Erreur API /api/game:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gameName, description } = await request.json();

    const user = await verifyToken(request);

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié." },
        { status: 401 }
      );
    }

    const newGame = await prisma.game.create({
      data: {
        id: crypto.randomUUID(),
        description: description,
        createdById: user.id,
        gameName: gameName,
        status: "WAITING_PLAYERS",
        gameCode: Math.random().toString(36).substring(2, 7).toUpperCase(),
      },
    });

    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    console.error("Erreur API /api/game:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
