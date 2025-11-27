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

const ROLES: Role[] = [
  {
    id: 1,
    name: "Assassin",
    order: 1,
    description:
      "L'Assassin peut assassiner un autre personnage ; le joueur ayant le personnage assassiné ne joue pas ce tour-là.",
    color: "Blanc",
  },
  {
    id: 2,
    name: "Voleur",
    order: 2,
    description:
      "Le Voleur peut choisir de voler un personnage, sauf l'Assassin ; lorsque le joueur dévoile son personnage, il donne ses pièces d'or au Voleur. Ceci se fait avant la perception par le joueur de ses pièces d'or du tour.",
    color: "Blanc",
  },
  {
    id: 3,
    name: "Magicien",
    order: 3,
    description:
      "Le Magicien peut échanger toute sa main (ses cartes « quartier ») contre la main d'un autre joueur ou échanger autant de cartes qu'il le veut de sa main avec la pioche.",
    color: "Blanc",
  },
  {
    id: 4,
    name: "Roi",
    order: 4,
    description:
      "Le Roi est le premier à choisir son personnage à partir du tour suivant. Chaque quartier « noble » lui rapporte 1 pièce d'or.",
    color: "Jaune",
  },
  {
    id: 5,
    name: "Évêque",
    order: 5,
    description:
      "Les quartiers de l'Évêque ne peuvent pas être détruits par le Condottière. Chaque quartier « religieux » lui rapporte 1 pièce d'or.",
    color: "Bleu",
  },
  {
    id: 6,
    name: "Marchand",
    order: 6,
    description:
      "Le Marchand perçoit d'office 1 pièce d'or, en plus de sa perception du tour. Chaque quartier « commerçant » lui rapporte 1 pièce d'or.",
    color: "vert",
  },
  {
    id: 7,
    name: "Architecte",
    order: 7,
    description:
      "L'Architecte pioche d'office 2 cartes, en plus de sa perception du tour, et il peut construire jusqu'à 3 quartiers par tour.",
    color: "Blanc",
  },
  {
    id: 8,
    name: "Condottiere",
    order: 8,
    description:
      "Le Condottiere peut détruire un quartier (éventuellement un des siens) en dépensant sa valeur moins 1 pièce d'or. Il peut donc détruire « gratuitement » un quartier coûtant 1 pièce d'or. Il ne peut détruire un quartier d'une citadelle déjà terminée (huit cartes posées devant le joueur). Chaque quartier « militaire » lui rapporte 1 pièce d'or.",
    color: "Rouge",
  },
];

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
    createdBy: createdBy,
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

    socket.on("disconnect", () => {
      console.log("socket disconnected", socket.id);
    });

    socket.on("createGame", async (data, cb) => {
      try {
        const g = await createGame(
          data.gameName,
          data.description,
          data.createdBy
        );

        const gameState: GameState = {
          id: uuidv4(),
          players: [],
          deck: g.deck,
          discard: [],
          phase: "WAITING_PLAYER",
          rolesOrder: g.roles
            .sort((a, b) => a.order - b.order)
            .map((r) => r.name),
          rolesPool: [],
          gameStep: "roleSelection",
        };

        games.set(g.id, { game: g, gameState: gameState });

        // 🔹 Création de la room
        console.log("data.gameId", g.id);
        socket.join(g.id);

        socket.emit("updateGameList", games);

        cb({ ok: true, gameId: g.id });
      } catch (err) {
        console.error("Erreur création de partie :", err);
        cb({ ok: false, error: "Erreur lors de la création de la partie." });
      }
    });

    socket.on("joinGame", (data, cb) => {
      const g = games.get(data.gameId);
      if (!g) return cb?.({ ok: false, error: "Game not found" });

      // Vérifie si le joueur est déjà dans la partie
      const existingPlayer = g.game.players.find(
        (p) => p.name === data.playerName
      );

      if (existingPlayer) {
        console.log(`🔁 ${data.playerName} se reconnecte`);
        existingPlayer.id = socket.id; // mettre à jour son socket.id
        socket.join(data.gameId);
        io.to(data.gameId).emit("updatePlayers", { players: g.game.players });
        return cb?.({ ok: true, playerId: existingPlayer.id, reconnect: true, gameState: g.gameState });
      }

      // Sinon, création normale
      const player: Player = {
        id: socket.id,
        name: data.playerName || `Player-${socket.id.slice(0, 4)}`,
        gold: 2,
        hand: [],
        city: [],
        isAlive: true,
        isCreator: data.isCreator || false,
      };

      g.game.players.push(player);
      g.gameState.players.push(player);
      socket.join(data.gameId);
      io.to(data.gameId).emit("updatePlayers", { players: g.game.players });
      cb?.({ ok: true, playerId: player.id });
    });


    socket.on('leaveGame', ({ gameId, playerId }, cb) => {
      const g = games.get(gameId);
      if (!g) return cb({ ok: false, error: "Game not found" });
      g.game.players = g.game.players.filter((p) => p.id !== playerId);
      g.gameState.players = g.gameState.players.filter((p) => p.id !== playerId);
      io.to(gameId).emit("updatePlayers", {
        players: g.game.players
      });
      cb({ ok: true });
    });

    socket.on("gameList", (cb) => {
      try {
        const gameList = Array.from(games.values());
        cb({ ok: true, gameList });
      } catch (err) {
        console.error("Erreur création de partie :", err);
        cb({ ok: false, error: "Erreur lors de la création de la partie." });
      }
    });

    socket.on("closeGame", async ({ gameId }, cb) => {
      const deletedGame = games.delete(gameId);
      if (!deletedGame) return cb({ ok: false, error: "Game not found" });
      io.to(gameId).emit("gameClosed");
      cb({ ok: true });
    });

    socket.on("startGame", async ({ gameId }, cb) => {
      const g = games.get(gameId);
      if (!g) return cb({ ok: false, error: "Game not found" });
      for (const p of g.gameState.players) {
        p.hand = g.gameState.deck.splice(0, 4);
      }
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
      g.gameState.phase = "roles";
      g.gameState.rolesPool = ROLES.map(r => r);
      g.gameState.currentPlayerId = g.gameState.players[0]?.id;
      g.gameState.currentRole = undefined;
      g.gameState.crownHolderId = g.gameState.players[0]?.id;
      g.game.state = "IN_PROGRESS";
      io.to(`${gameId}`).emit("gameStarted");
      io.to(`${gameId}`).emit("gameState", g.gameState);
      cb({ ok: true });
    });

    socket.on("chooseRole", ({ gameId, role }, cb) => {
      const g = games.get(gameId);
      if (!g) return cb({ ok: false, error: "Game not found" });

      const player = g.gameState.players.find(p => p.id === g.gameState.currentPlayerId);
      if (!player) return cb({ ok: false, error: "Player not found" });

      // vérifier que le rôle est disponible
      if (!g.gameState.rolesPool.some((r: Role) => r.name.toLowerCase() === role.name.toLowerCase())) {
        return cb({ ok: false, error: "Role not available" });
      }

      // assigner le rôle au joueur
      player.role = role;
      g.gameState.rolesPool = g.gameState.rolesPool.filter(r => r.name !== role.name);
      g.gameState.rolesOrder?.push(role);
      g.gameState.players = g.gameState.players.map(p => p.id === player.id ? player : p);

      const remainingPlayers = g.gameState.players.filter(p => !p.role);
      if (remainingPlayers.length > 0) {
        g.gameState.currentPlayerId = remainingPlayers[0].id;
      } else {
        g.gameState.gameStep = "playerTurn";
        g.gameState.rolesPool = ROLES.map(r => r);

        const orderedRoles = ROLES.toSorted((a, b) => a.order - b.order);

        let firstPlayer: Player | null = null;
        for (const role of orderedRoles) {
          const candidate = g.gameState.players.find(p => p.role?.name === role.name);
          if (candidate) {
            firstPlayer = candidate;
            break;
          }
        }
        if (!firstPlayer) {
          return cb({ ok: false, error: "No player found for first turn" });
        }
        g.gameState.currentPlayerId = firstPlayer.id;
        io.to(gameId).emit("log", `${firstPlayer.name} commence le tour avec le rôle ${firstPlayer.role!.name} !`)

        io.to(gameId).emit("gameState", g.gameState);
        io.to(gameId).emit("log", `Tous les joueurs ont choisi leurs rôles !`);
        return cb({ ok: true, role, message: "All roles chosen" });
      }
      io.to(gameId).emit("gameState", g.gameState);
      cb({ ok: true, role });
    });

    socket.on("playerAction", ({ gameId, playerId, action, actionDetail = '', targetRole = '', cardToKeep, playerTargeted, cardToExchange }, cb) => {
      console.log('playerAction', action, actionDetail, targetRole);
      const g = games.get(gameId);
      if (!g) return cb({ ok: false, error: "Game not found" });
      const player = g.gameState.players.find((p) => p.id === playerId);
      if (!player) return cb({ ok: false, error: "Player not found" });
      if (g.gameState.currentPlayerId !== playerId)
        return cb({ ok: false, error: "Not your turn" });

      switch (action) {
        case "takeGold":
          player.gold += 2;
          io.to(gameId).emit("gameState", g.gameState);
          break;
        case "drawCards":
          {
            const drawn = g.gameState.deck.splice(0, 2);
            let kept: Building | undefined = undefined;
            if (cardToKeep) {
              kept = drawn.find((c) => c.id === cardToKeep);
            } else {
              kept = drawn[0];
            }
            if (!kept) return cb({ ok: false, error: "Card to keep not found" });
            player.hand.push(kept);
            g.gameState.discard.push(...drawn.filter((c) => c.id !== kept?.id));
            io.to(gameId).emit("gameState", g.gameState);
            break;
          }

        case "build": {
          const card = player.hand.find((c) => c.id === cardToKeep.id);
          if (!card) return cb({ ok: false, error: "Card not in hand" });
          if (player.gold < card.cost)
            return cb({ ok: false, error: "Not enough gold" });

          player.gold -= card.cost;
          player.city.push(card);
          player.hand = player.hand.filter((c) => c.id !== card.id);

          const currentIndex = g.gameState.players.findIndex(
            (p) => p.id === player.id
          );

          const nextIndex = (currentIndex + 1);
          if (nextIndex > g.gameState.players.length) {
            g.gameState.phase = "endRound";
            setNewRound(g)
            io.to(gameId).emit("roundEnded", g.gameState);
          } else {
            g.gameState.currentPlayerId = g.gameState.players[nextIndex].id;
          }
          io.to(gameId).emit("gameState", g.gameState);

          cb({ ok: true });
          break;
        }

        case "roleSpecial":
          console.log(actionDetail)
          switch (actionDetail) {
            case "Assassin": {
              const targetPlayer = g.gameState.players.find(p => p.role?.name === targetRole);
              console.log(targetPlayer)
              if (targetPlayer) {
                targetPlayer.isAlive = false;
              }
              io.to(gameId).emit("log", `${player.name} a assassiné le ${targetRole} !`);
              break;
            }

            case "Voleur": {
              const targetRole = cb?.targetRole;
              const target = g.gameState.players.find(p => p.role === targetRole && p.isAlive);
              if (target && target.role?.name !== "Assassin") {
                const stolen = target.gold;
                target.gold = 0;
                player.gold += stolen;
                io.to(gameId).emit("log", `${player.name} a volé ${stolen} or au ${targetRole} !`);
              }
              break;
            }

            case "swpaHand": {
              if (playerTargeted) {
                const target = g.gameState.players.find(p => p.id === playerTargeted);
                if (!target) return cb({ ok: false, error: "Target not found" });
                const temp = player.hand;
                player.hand = target.hand;
                target.hand = temp;
                io.to(gameId).emit("log", `${player.name} a échangé sa main avec ${target.name}`);
              }
              break;
            }
            case "swapDeck": {
              // Échanger certaines cartes contre la pioche
              const newCards = g.gameState.deck.splice(0, cardToExchange.length);
              cardToExchange.forEach((cid: string) => {
                const idx = player.hand.findIndex((c) => c.id === cid);
                if (idx >= 0) {
                  g.gameState.discard.push(player.hand[idx]);
                  player.hand.splice(idx, 1);
                }
              });
              player.hand.push(...newCards);
              io.to(gameId).emit("log", `${player.name} a échangé des cartes avec la pioche`);
              break;
            }

            case "Roi": {
              g.gameState.crownHolderId = player.id;
              const bonus = player.city.filter(c => c.color === "Jaune").length;
              player.gold += bonus;
              io.to(gameId).emit("log", `${player.name} reçoit ${bonus} or pour ses quartiers nobles`);
              break;
            }

            case "Évêque": {
              // Bonus or
              const bonus = player.city.filter(c => c.color === "Bleu").length;
              player.gold += bonus;
              io.to(gameId).emit("log", `${player.name} reçoit ${bonus} or pour ses quartiers religieux`);
              break;
            }

            case "Marchand": {
              player.gold += 1; // gain automatique
              const bonus = player.city.filter(c => c.color === "vert").length;
              player.gold += bonus;
              io.to(gameId).emit("log", `${player.name} reçoit ${bonus + 1} or grâce à ses commerces`);
              break;
            }

            case "Architecte": {
              const bonusCards = g.gameState.deck.splice(0, 2);
              player.hand.push(...bonusCards);
              io.to(gameId).emit("log", `${player.name} pioche 2 cartes supplémentaires`);
              break;
            }

            case "Condottiere": {
              const { targetPlayerId, buildingId } = cb || {};
              const target = g.gameState.players.find(p => p.id === targetPlayerId);
              if (!target) return cb({ ok: false, error: "Target not found" });
              if (target.role?.name === "Évêque")
                return cb({ ok: false, error: "Cannot destroy bishop's building" });

              const building = target.city.find(c => c.id === buildingId);
              if (!building) return cb({ ok: false, error: "Building not found" });

              const cost = Math.max(0, building.cost - 1);
              if (player.gold < cost)
                return cb({ ok: false, error: "Not enough gold" });

              player.gold -= cost;
              target.city = target.city.filter(c => c.id !== building.id);
              g.gameState.discard.push(building);

              const bonus = player.city.filter(c => c.color === "Rouge").length;
              player.gold += bonus;

              io.to(gameId).emit("log", `${player.name} détruit ${target.name} (${building.name}) pour ${cost} or`);
              break;
            }

            default:
              return cb({ ok: false, error: "Unknown role special" });
          }
          break;

        default:
          return cb({ ok: false, error: "Unknown action" });
      }

      io.to(gameId).emit("gameState", g.gameState);
      cb({ ok: true });
    });


    socket.on("endTurn", ({ gameId, playerId }, cb) => {
      const g = games.get(gameId);
      if (!g) return cb({ ok: false, error: "Game not found" });
      const current = g.gameState.players.find((p) => p.id === playerId);
      if (!current) return cb({ ok: false, error: "Player not found" });
      if (g.gameState.currentPlayerId !== playerId && current.isAlive)
        return cb({ ok: false, error: "Veuiller patienter les joueurs choisissent leur rôle" });

      const orderedRoles = [
        "Assassin",
        "Voleur",
        "Magicien",
        "Roi",
        "Évêque",
        "Marchand",
        "Architecte",
        "Condottiere",
      ];
      const currentIndex = orderedRoles.indexOf(current.role!.name);
      let nextPlayer;
      for (let i = currentIndex + 1; i < orderedRoles.length; i++) {
        const nextRole = orderedRoles[i];
        nextPlayer = g.gameState.players.find((p) => p.role?.name === nextRole);
        if (nextPlayer) break;
      }

      if (!nextPlayer) {
        g.gameState.phase = "endRound";
        setNewRound(g)
        io.to(gameId).emit("roundEnded", g.gameState);
        return cb({ ok: true, message: "Round ended" });
      } else if (nextPlayer.isAlive === false) {
        g.gameState.currentRole = nextPlayer.role;
        const roleIndex = g.gameState.rolesOrder?.indexOf(nextPlayer.role!.name);
        const nextIndex = (roleIndex !== undefined) ? roleIndex + 1 : 0;
        if (g.gameState.rolesOrder && g.gameState.rolesOrder[nextIndex] !== undefined) {
          const nextPlayer = g.gameState.players.find(p => p.role?.name === g.gameState.rolesOrder[nextIndex]);
          if (nextPlayer) {
            g.gameState.currentRole = nextPlayer.role;
            g.gameState.currentPlayerId = nextPlayer.id;
          } else {
            g.gameState.phase = "endRound";
            setNewRound(g)
            io.to(gameId).emit("roundEnded", g.gameState);
          }
        io.to(gameId).emit("gameState", g.gameState);
        }
        return cb({ ok: true, message: "Next player was assassinated, skipping turn" });
      }
      g.gameState.currentPlayerId = nextPlayer.id;
      io.to(gameId).emit("gameState", g.gameState);
      cb({ ok: true });
    });


    socket.on("requestState", ({ gameId }, cb) => {
      const g = games.get(gameId);
      if (!g) return cb({ ok: false, error: "Game not found" });
      cb({ ok: true, state: g.gameState });
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected", socket.id);
      // optionnel : marquer comme déconnecté; ne pas supprimer joueur immédiatement
    });

    socket.on('startNextRound', ({ gameId }, cb) => {
      const g = games.get(gameId);
      if (g) {
        console.log('startNextRound', gameId);
        setNewRound(g);
        io.to(gameId).emit("gameState", g.gameState);
        cb({ ok: true });
      }
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

function getGameByCode(code: string) {
  for (const [, value] of games) {
    // on ignore la clé, on prend juste la valeur
    if (value.game.code === code) {
      return value;
    }
  }
  return undefined; // si aucun match
}

function setNewRound(g: { game: Game; gameState: GameState; }) {
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
  g.gameState.gameStep = "roleSelection";
  for (const p of g.gameState.players) {
    p.role = undefined;
    p.isAlive = true;
  }
  g.gameState.rolesPool = ROLES.map(r => r);
  g.gameState.currentPlayerId = g.gameState.crownHolderId;
  g.gameState.currentRole = undefined;
  return g;
}
