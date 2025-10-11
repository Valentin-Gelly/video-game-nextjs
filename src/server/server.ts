// server.ts (Node + express + socket.io)
import { GameState, Building, Player, Game, Role } from "./gameManager";
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
export const app = next({ dev, hostname, port });
const games = new Map<
  string,
  {
    game: Game;
    gameState: GameState;
  }
>();

// Nombre de copies par carte selon Citadelles classique
const CARD_COPIES: Record<string, number> = {
  // Bleu
  Temple: 3,
  Église: 3,
  Monastère: 3,
  Cathédrale: 1,
  // Jaune
  Manoir: 3,
  Château: 3,
  Palais: 1,
  // Vert
  Taverne: 3,
  Échoppe: 3,
  Marché: 3,
  Comptoir: 3,
  Port: 3,
  "Hôtel de ville": 1,
  // Rouge
  "Tour de guet": 3,
  Prison: 3,
  Caserne: 3,
  Forteresse: 1,
  // Violet
  "Cour des miracles": 1,
  Donjon: 1,
  Laboratoire: 1,
  Manufacture: 1,
  Observatoire: 1,
  Cimetière: 1,
  Bibliothèque: 1,
  "École de magie": 1,
  Université: 1,
  Dracoport: 1,
};

async function createGame(
  gameName: string,
  description: string,
  createdBy: string
): Promise<Game> {
  // récupérer les cartes via une URL absolue
  const res = await fetch(`http://${hostname}:${port}/api/games/cards`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    console.error("Erreur de récupération des cartes :", await res.text());
    throw new Error("Impossible de charger les cartes");
  }

  const cards: Building[] = await res.json();

  // Exemple dans une fonction async
  const resRoles = await fetch(`http://${hostname}:${port}/api/games/roles`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!resRoles.ok) {
    console.error("Erreur de récupération des cartes :", await resRoles.text());
    throw new Error("Impossible de charger les cartes");
  }

  const roles: Role[] = await resRoles.json();

  console.log("✅ Cartes chargées :", cards);

  return {
    id: uuidv4(),
    code: Math.random().toString(36).slice(2).slice(0, 6).toUpperCase(),
    name: gameName,
    description: description,
    players: [],
    deck: shuffleCards(cards),
    roles: roles,
    state: "WAITING",
    createdAt: new Date(),
    createdBy: createdBy
  };
}

export function shuffleCards(cards: Building[]): Building[] {
  const deck: Building[] = [];
  for (const card of cards) {
    const copies = CARD_COPIES[card.name] || 1;
    for (let i = 0; i < copies; i++) {
      deck.push({ ...card });
    }
  }

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}
app.prepare().then(() => {
  const handler = app.getRequestHandler();
  const httpServer = createServer(handler);
  const io = new Server(httpServer);
  io.on("connection", (socket) => {
    console.log("socket connected 2", socket.id);

    socket.on("createGame", async (data, cb) => {
      try {
        const g = await createGame(
          data.gameName,
          data.description,
          data.createdBy
        );

        const gameState = {
          id: uuidv4(),
          players: [],
          deck: g.deck,
          discard: [],
          phase: "WAITING_PLAYER",
          rolesOrder: g.roles
            .sort((a, b) => a.order - b.order)
            .map((r) => r.name),
        };

        games.set(g.id, { game: g, gameState });

        // 🔹 Création de la room
        socket.join(g.id);

        console.log(`🎮 Partie créée : ${g.id}`);

        cb({ ok: true, gameId: g.id });
      } catch (err) {
        console.error("Erreur création de partie :", err);
        cb({ ok: false, error: "Erreur lors de la création de la partie." });
      }
    });

    socket.on("gameList", (cb) => {
      try {
        console.log("gamelist 2", games);
        const gameList = Array.from(games.values());
        console.log("gameListe after treatment", gameList);
        cb({ ok: true, gameList });
      } catch (err) {
        console.error("Erreur création de partie :", err);
        cb({ ok: false, error: "Erreur lors de la création de la partie." });
      }
    });

    socket.on("joinGame", ({ gameId, playerName }, cb) => {
      const g = games.get(gameId);
      if (!g) return cb({ ok: false, error: "Game not found" });

      const player: Player = {
        id: socket.id,
        name: playerName || `Player-${socket.id.slice(0, 4)}`,
        gold: 2,
        hand: [],
        city: [],
        isAlive: true,
      };
      g.game.players.push(player);
      g.gameState.players.push(player);
      socket.join(`${gameId}`);
      io.to(`${gameId}`).emit("gameState", sanitize(g.gameState));
      cb({ ok: true, playerId: player.id });
    });

    socket.on("startGame", async ({ gameId }, cb) => {
      const g = games.get(gameId);
      if (!g) return cb({ ok: false, error: "Game not found" });
      for (const p of g.gameState.players) {
        p.hand = g.gameState.deck.splice(0, 4);
      }
      g.gameState.phase = "roles";
      g.gameState.rolesOrder = [
        "Assassin",
        "Voleur",
        "Magicien",
        "Roi",
        "Eveque",
        "Condottiere",
        "Marchand",
        "Architecte",
      ];
      // choisir premier joueur aléatoire
      g.gameState.currentPlayerId = g.gameState.players.length
        ? g.gameState.players[0].id
        : undefined;
      io.to(`${gameId}`).emit("gameState", sanitize(g.gameState));
      cb({ ok: true });
    });

    socket.on("chooseRole", ({ gameId, playerId, role }, cb) => {
      const g = games.get(gameId);
      if (!g) return cb({ ok: false, error: "Game not found" });
      const p = g.gameState.players.find((x) => x.id === playerId);
      if (!p) return cb({ ok: false, error: "Player not found" });
      // validation: rôle disponible?
      if (!g.gameState.rolesOrder || !g.gameState.rolesOrder.includes(role)) {
        return cb({ ok: false, error: "Role not available" });
      }
      p.role = role;
      // remove role from pool (simple)
      g.gameState.rolesOrder = g.gameState.rolesOrder.filter((r) => r !== role);
      io.to(`${gameId}`).emit("gameState", sanitize(g.gameState));
      cb({ ok: true });
    });

    socket.on("playCard", ({ gameId, playerId, cardId }, cb) => {
      const g = games.get(gameId);
      if (!g) return cb({ ok: false, error: "Game not found" });
      const p = g.gameState.players.find((x) => x.id === playerId);
      if (!p) return cb({ ok: false, error: "Player not found" });
      // validation : c'est bien le tour du joueur ?
      if (g.gameState.currentPlayerId !== playerId)
        return cb({ ok: false, error: "Not your turn" });
      const cardIndex = p.hand.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return cb({ ok: false, error: "Card not in hand" });
      const card = p.hand.splice(cardIndex, 1)[0];
      p.city.push(card);
      io.to(`${gameId}`).emit("gameState", sanitize(g.gameState));
      cb({ ok: true });
    });

    socket.on("endTurn", ({ gameId, playerId }, cb) => {
      const g = games.get(gameId);
      if (!g) return cb({ ok: false, error: "Game not found" });

      const currentPlayer = g.gameState.players.find((p) => p.id === playerId);
      if (!currentPlayer) return cb({ ok: false, error: "Player not found" });
      if (g.gameState.currentPlayerId !== playerId)
        return cb({ ok: false, error: "Not your turn" });

      // 🔹 Déterminer le rôle actuel et le rôle suivant
      const currentRole = currentPlayer.role;
      if (!currentRole || !g.gameState.rolesOrder)
        return cb({ ok: false, error: "Missing roles info" });

      const currentIndex = g.gameState.rolesOrder.indexOf(currentRole);

      // 🔹 Cherche le prochain joueur avec le rôle suivant
      let nextPlayer: Player | undefined = undefined;

      for (let i = 1; i < g.gameState.rolesOrder.length; i++) {
        const nextRole =
          g.gameState.rolesOrder[
            (currentIndex + i) % g.gameState.rolesOrder.length
          ];
        const candidate = g.gameState.players.find((p) => p.role === nextRole);
        if (candidate) {
          nextPlayer = candidate;
          break;
        }
      }

      if (!nextPlayer) {
        // 🔹 Si aucun joueur suivant n’a de rôle → fin de manche
        g.gameState.phase = "endRound";
        io.to(`${gameId}`).emit("gameEnded", sanitize(g.gameState));
        return cb({ ok: true, message: "Round ended" });
      }

      // 🔹 Passe le tour au joueur suivant selon le rôle
      g.gameState.currentPlayerId = nextPlayer.id;
      io.to(`${gameId}`).emit("gameState", sanitize(g.gameState));
      cb({ ok: true });
    });

    socket.on("requestState", ({ gameId }, cb) => {
      const g = games.get(gameId);
      if (!g) return cb({ ok: false, error: "Game not found" });
      cb({ ok: true, state: sanitize(g.gameState) });
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected", socket.id);
      // optionnel : marquer comme déconnecté; ne pas supprimer joueur immédiatement
    });
  });

  httpServer
    .once("error", (err) => {
      console.error("❌ Erreur du serveur HTTP:", err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 Serveur Next.js prêt sur http://${hostname}:${port}`);
      console.log(
        `📡 Serveur Socket.IO actif avec gestion des rooms et historique d'actions`
      );
    });
});

function sanitize(g: GameState) {
  // éviter d'envoyer trop de data (par ex. cartes ennemies en main)
  // pour l'exemple, retourne l'état entier
  return g;
}
