import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mail";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: 'Paramètre \"userId\" manquant.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findMany({
      where: { id: Number(userId) },
    });

    if (user.length === 0) {
      return NextResponse.json(
        { message: "Aucune partie trouvée pour cet utilisateur." },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Erreur API /api/users:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    console.log("Requête reçue");
    const { email, password, lastname, firstname, username } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json(
        { error: "Email déjà utilisé" },
        { status: 400 }
      );
    console.log(email, password, lastname, firstname, username);

    const hashed = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");
    // Créer l'utilisateur **et** sa ligne Stats en même temps
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashed,
        verifiedToken: token,
        lastname: lastname,
        firstname: firstname,
        username: username,
        emailVerified: false,
      },
    });

    await sendVerificationEmail(user.email, token);

    return NextResponse.json({
      message:
        "Inscription réussie. Vérifiez votre e-mail pour confirmer votre compte.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
