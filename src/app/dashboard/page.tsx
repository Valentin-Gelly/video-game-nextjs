"use client";

import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "@/context/globalContext";

interface GameInfo {
  id: number;
  score: number;
  result: number;
  createdAt: string;
}

export default function GameList() {
  const [scores, setScores] = useState<GameInfo[]>([]);
  const { token, setToken, setIdUser, idUser } = useContext(GlobalContext);
  const userId = idUser;

  useEffect(() => {
    async function loadScores() {
      if (!userId) return;

      try {
        const response = await fetch(`/api/users/${userId}/games`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setScores(data);
        } else {
          console.error("Erreur lors de la récupération des scores");
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
      }
    }
    loadScores();
  }, [userId]);

  return (
    <div
      className="p-10 flex flex-col items-center mt-24 w-full"
      style={{ backgroundColor: "#C2B280" }} // beige doré
    >
      <div className="w-full bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: "#4B4E6D" }}>
            Tableau des Scores
          </h1>
          <p className="text-lg" style={{ color: "#7D5B3A" }}>
            Historique de vos parties Citadelles
          </p>
        </header>

        <div className="overflow-x-auto rounded-xl">
          <table
            className="min-w-full divide-y"
            style={{ borderColor: "#7D5B3A" }}
          >
            <thead style={{ backgroundColor: "#4B4E6D" }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                  Résultat
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "#A8D8B9" }}>
              {scores.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-sm"
                    style={{ color: "#4B4E6D" }}
                  >
                    Aucune partie jouée pour le moment.
                  </td>
                </tr>
              ) : (
                scores.map((s) => (
                  <tr
                    key={s.id}
                    className="transition-colors duration-200 cursor-pointer"
                    style={{ backgroundColor: "#A8D8B950" }}
                    onClick={() =>
                      (window.location.href = `/citadelles/partie/${s.id}`)
                    }
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#D9DF77")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#A8D8B950")
                    }
                  >
                    <td
                      className="px-6 py-4 text-sm font-medium"
                      style={{ color: "#4B4E6D" }}
                    >
                      {new Date(s.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td
                      className="px-6 py-4 text-sm font-semibold"
                      style={{ color: "#7D5B3A" }}
                    >
                      {s.result === 1 ? "🏆 Victoire" : "💀 Défaite"}
                    </td>
                    <td
                      className="px-6 py-4 text-sm font-bold"
                      style={{ color: "#4B4E6D" }}
                    >
                      {s.score}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#7D5B3A] text-white text-center py-4 text-sm">
        © 2025 — Si t&apos;as de l&apos;or • Tous droits réservés
      </footer>
    </div>
  );
}
