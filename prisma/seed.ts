const { PrismaClient } = require('../src/generated/prisma'); // chemin relatif correct

const prisma = new PrismaClient();

async function main() {
    // Création des utilisateurs
    await prisma.user.createMany({
        data: [
            { email: 'alice@example.com', userName: 'AliceWonder', password: 'hashed_pwd_1' },
            { email: 'bob@example.com', userName: 'BobBuilder', password: 'hashed_pwd_2' },
            { email: 'charlie@example.com', userName: 'CharliePlay', password: 'hashed_pwd_3' },
        ],
    });

    // Création des jeux
    await prisma.games.createMany({
        data: [
            { gameState: 'finished' },
            { gameState: 'in_progress' },
            { gameState: 'waiting' },
        ],
    });

    // Récupération des IDs
    const allUsers = await prisma.user.findMany();
    const allGames = await prisma.games.findMany();

    // Création des scores (GameInfos)
    await prisma.gameInfos.createMany({
        data: [
            {
                userId: allUsers[0].id,
                gameId: allGames[0].id,
                score: 250,
            },
            {
                userId: allUsers[1].id,
                gameId: allGames[0].id,
                score: 320,
            },
            {
                userId: allUsers[1].id,
                gameId: allGames[1].id,
                score: 180,
            },
            {
                userId: allUsers[2].id,
                gameId: allGames[2].id,
                score: 90,
            },
            {
                userId: allUsers[0].id,
                gameId: allGames[2].id,
                score: 150,
            },
        ],
    });

    console.log('✅ Jeu de données inséré avec succès');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
