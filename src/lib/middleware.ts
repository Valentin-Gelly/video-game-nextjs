import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function verifyToken(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    throw new Error("Token manquant");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
    };
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) throw new Error("Utilisateur introuvable");
    return user;
  } catch (err) {
    throw new Error("Token invalide ou expiré");
  }
}
