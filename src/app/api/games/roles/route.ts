import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cards = await prisma.roleCard.findMany();
    return NextResponse.json(cards, { status: 200 });
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
