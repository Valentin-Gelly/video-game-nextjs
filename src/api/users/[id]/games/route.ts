import {prisma} from "@/lib/prisma";

export async function GET() {
    const db = await prisma.user.findMany();
    return new Response("Hello, this is the user games API endpoint!");
}