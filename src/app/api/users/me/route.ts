import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req);

    return NextResponse.json({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    const body = await req.json();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstname: body.firstname,
        lastname: body.lastname,
        username: body.username,
        email: body.email,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
