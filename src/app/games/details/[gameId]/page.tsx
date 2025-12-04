"use client";

import { useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GlobalContext } from "@/context/globalContext";

interface GameDetails {
  id: string;
  gameName: string;
  description: string;
  gameCode: string;
  status: string;
  currentTurn: number;
  createdAt: string;
  createdById: number;
}

interface User {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
}

interface PlayerGameInfo {
  id: number;
  userId: number;
  score: number;
  result: number;
  gameId: string;
  createdAt: string;
  rank: number;
  user: User | null;
}

interface GameResponse {
  game: GameDetails;
  players: PlayerGameInfo[];
}

export default function GameDetailsPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const [gameData, setGameData] = useState<GameResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const context = useContext(GlobalContext);
  const idUser = context?.idUser;

  useEffect(() => {
    if (!gameId) return;

    const fetchGameDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/games/${gameId}`);

        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`);
        }

        const data = await response.json();
        setGameData(data);
        setError(null);
      } catch (err) {
        console.error("Erreur lors de la récupération des détails du jeu:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [gameId]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "#C2B280" }}
      >
        <p className="text-lg">Chargement des détails de la partie...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "#C2B280" }}
      >
        <div className="bg-white/70 p-8 rounded-2xl shadow-xl text-center">
          <p className="text-red-500 text-lg mb-4">Erreur: {error}</p>
          <Link href="/dashboard" className="text-blue-500 underline">
            Retour aux parties
          </Link>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "#C2B280" }}
      >
        <p>Aucune information trouvée pour cette partie.</p>
      </div>
    );
  }

  const { game, players } = gameData;
  const createdDate = new Date(game.createdAt).toLocaleDateString("fr-FR");

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "📊";
    }
  };

  const getBackgroundColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#FFF4C2";
      case 2:
        return "#E4E4E4";
      case 3:
        return "#FFD8B2";
      default:
        return "#F7F7F7";
    }
  };

  return (
    <div
      className="min-h-screen p-6 flex justify-center pt-[17vh]"
      style={{ backgroundColor: "#C2B280" }}
    >
      <div className="max-w-5xl w-full">
        {/* Retour */}
        <Link
          href="/dashboard/user"
          className="text-lg underline mb-6 inline-block"
          style={{ color: "#4B4E6D" }}
        >
          ← Retour aux parties
        </Link>

        {/* Carte d’informations du jeu */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-10">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: "#4B4E6D" }}
          >
            {game.gameName}
          </h1>
          <p className="text-lg mb-6" style={{ color: "#7D5B3A" }}>
            {game.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm" style={{ color: "#7D5B3A" }}>
                Code de partie
              </p>
              <p className="text-xl font-bold" style={{ color: "#4B4E6D" }}>
                {game.gameCode}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: "#7D5B3A" }}>
                Créée le
              </p>
              <p className="text-xl font-bold" style={{ color: "#4B4E6D" }}>
                {createdDate}
              </p>
            </div>
          </div>
        </div>

        {/* Classement */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <h2
            className="text-3xl font-bold mb-6"
            style={{ color: "#4B4E6D" }}
          >
            Classement Final ({players.length} joueurs)
          </h2>

          <div className="space-y-6">
            {players.map((player) => (
              <div
                key={player.id}
                className="rounded-xl p-6 shadow-md"
                style={{
                  backgroundColor: getBackgroundColor(player.rank),
                }}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{getMedalEmoji(player.rank)}</span>
                    <div>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "#4B4E6D" }}
                      >
                        #{player.rank}
                      </p>
                      {(() => {
                        let playerName = player.user
                          ? `${player.user.firstname} ${player.user.lastname}`
                          : `Joueur invité #${player.userId}`;
                        let isYou = idUser && +idUser === +player.userId ? " (Vous)" : "";
                        return (
                          <p className="text-lg" style={{ color: "#7D5B3A" }}>
                            {playerName}{isYou}
                          </p>
                        );
                      })()}
                      {player.user && (
                        <p className="text-sm" style={{ color: "#4B4E6D" }}>
                          @{player.user.username}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <p
                      className="text-5xl font-bold"
                      style={{ color: "#4B4E6D" }}
                    >
                      {player.score}
                    </p>
                    <p className="text-sm" style={{ color: "#7D5B3A" }}>
                      points
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {players.length === 0 && (
              <p className="text-center py-6" style={{ color: "#4B4E6D" }}>
                Aucun joueur n’a participé à cette partie.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
