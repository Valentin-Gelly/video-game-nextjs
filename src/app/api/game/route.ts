import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Paramètre \"userId\" manquant.' }, { status: 400 });
        }

        const userGameInfos = await prisma.gameInfos.findMany({
            where: { userId: userId },
            include: {
                user: true,
                game: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        if (userGameInfos.length === 0) {
            return NextResponse.json({ message: 'Aucune partie trouvée pour cet utilisateur.' }, { status: 404 });
        }

        return NextResponse.json(userGameInfos, { status: 200 });
    } catch (error) {
        console.error('Erreur API /api/game:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
