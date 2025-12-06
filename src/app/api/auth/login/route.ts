import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET as string;


export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 400 }
      );

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error:
            "Compte non vérifié. Vérifiez votre e-mail pour activer votre compte.",
        },
        { status: 403 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return NextResponse.json(
        { error: "Mot de passe incorrect" },
        { status: 400 }
      );

    if (!JWT_SECRET) throw new Error("JWT_SECRET manquant");


    const token = jwt.sign(
      { email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );



    const response = NextResponse.json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        token: token,
      },
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS en production
      sameSite: "strict", // Plus sécurisé que "lax"
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".valentingelly.cloud" : undefined, // Ajouter le domaine en production
    });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
