import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: 'Paramètre "code" manquant.' },
      { status: 400 }
    );
  }

  try {
    const gameUnique = await prisma.game.findUnique({
      where: { gameCode: code },
    });

    if (!gameUnique) {
      return NextResponse.json(
        { error: "Partie non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(gameUnique);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
