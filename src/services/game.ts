import { Server as IOServer } from "socket.io";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function startGameHandler(
  io: IOServer,
  gameId: string,
  playerIds: number[]
) {
  // 4) Mélanger le deck
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw new Error("Game not found");

  const createdBuildingCards = await prisma.buildingCard.findMany({
    where: { gameId: game.id },
    include: { Building: true },
  });
  const shuffled = shuffle(createdBuildingCards.slice());

  // 5) Distribuer CARDS_PER_PLAYER cartes en main
  const updates: Promise<any>[] = [];
  let cursor = 0;
  const playersWithCards: Array<{ playerId: number; hand: any[] }> = [];

  for (const playerId of playerIds) {
    const hand = shuffled.slice(cursor, cursor + 7);
    cursor += 7;

    const handUpdatePromises = hand.map((card) =>
      prisma.buildingCard.update({
        where: { id: card.id },
        data: { status: "hand", playerHandId: playerId },
      })
    );

    updates.push(...handUpdatePromises);
    playersWithCards.push({ playerId, hand });
  }

  // 6) Le reste du deck garde status 'deck' — si vous voulez un "discard" initial, faites-le ici

  // 7) Créer GameRole pour chaque RoleCard
  const roleCards = await prisma.roleCard.findMany();
  const gameRoleCreates = roleCards.map((rc) =>
    prisma.gameRole.create({
      data: {
        isAvailable: true,
        gameId: game.id,
        roleCardId: rc.id,
      },
    })
  );

  // 8) Exécuter toutes les mises à jour en transaction
  await prisma.$transaction([...updates, ...gameRoleCreates]);

  // 9) Charger l'état à renvoyer
  const finalPlayers = await prisma.player.findMany({
    where: { id: { in: playerIds } },
    include: {
      hand: { include: { Building: true } },
      city: { include: { Building: true } },
      user: true,
    },
  });

  const finalRoles = await prisma.gameRole.findMany({
    where: { gameId: game.id },
    include: { roleCard: true },
  });

  const deckCount = await prisma.buildingCard.count({
    where: { gameId: game.id, status: "deck" },
  });

  // 10) Émettre l'événement dans la room gameId
  io.to(game.id).emit("gameStarted", {
    game: { id: game.id, status: "started", currentTurn: 0 },
    players: finalPlayers.map((p) => ({
      id: p.id,
      name: p.name,
      hand: p.hand.map((c) => ({ id: c.id, building: c.Building })),
    })),
    roles: finalRoles.map((r) => ({
      id: r.id,
      isAvailable: r.isAvailable,
      roleCard: r.roleCard,
    })),
    deckCount,
  });

  // 11) Mettre à jour le statut final de la partie
  await prisma.game.update({
    where: { id: game.id },
    data: { status: "started" },
  });

  return { gameId: game.id };
}
