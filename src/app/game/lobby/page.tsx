"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { socket } from "../../../server/socket";
import { useRouter } from "next/navigation";
import { GameState, Game } from "@/server/gameManager";

export default function Lobby() {
  const [joinCode, setJoinCode] = useState("");
  const [games, setGames] = useState(
    [] as { game: Game; gameState: GameState }[]
  );
  const router = useRouter();
  const [gameName, setGameName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    socket.emit(
      "gameList",
      (res: {
        ok: boolean;
        gameList: { game: Game; gameState: GameState }[];
      }) => {
        setGames(res.gameList);
        console.log("gameList", res);
      }
    );

    return () => {
      socket.off("gameState");
    };
  }, []);

  async function handleCreateGame() {
    if (!gameName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Nom de partie requis",
        text: "Veuillez donner un nom à votre partie.",
      });
      return;
    }

    socket.emit(
      "createGame",
      { gameName, description },
      (res: { ok: boolean; gameId?: string; error?: string }) => {
        if (!res.ok) {
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text: res.error || "Impossible de créer la partie.",
          });
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Partie créée 🎉",
          text: `Ta partie "${gameName}" est prête !`,
        });

        const modal = document.getElementById(
          "my_modal_1"
        ) as HTMLDialogElement;
        modal.close();
        setGameName("");
        setDescription("");
        router.push(`/game/game-table?id=${res.gameId}`);
      }
    );
  }

  async function joinGame() {
    if (!joinCode.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Code requis",
        text: "Veuillez entrer le code de la partie.",
      });
      return;
    }

    setIsLoading(true);

    socket.emit(
      "joinGame",
      { gameId: joinCode, playerName: "Moi" },
      (res: { ok: boolean; error?: string; playerId?: string }) => {
        setIsLoading(false);

        if (!res.ok) {
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text: res.error || "Impossible de rejoindre la partie.",
          });
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Partie rejointe 🎉",
        });

        router.push(`/game/game-table?id=${joinCode}`);
      }
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#C2B280]/20">
      {/* HEADER */}
      <header className="bg-[#4B4E6D] py-4 px-8 flex justify-between items-center shadow-lg mt-[15vh]">
        <h1 className="text-2xl font-bold">
          🎲 Si t&apos;as de l&apos;or — Lobby
        </h1>
        <button
          className="bg-[#A8D8B9] text-[#4B4E6D] font-semibold px-4 py-2 rounded-xl hover:scale-105 transition-transform"
          onClick={() => document.getElementById("my_modal_1")!.showModal()}
        >
          Créer une partie
        </button>
        <dialog id="my_modal_1" className="modal">
          <div className="modal-box bg-white rounded-2xl shadow-lg border border-[#A8D8B9]">
            <h3 className="font-bold text-lg text-[#4B4E6D]">
              Créer votre propre partie
            </h3>
            <p className="py-4 text-slate-600">
              Choisissez un nom et une description pour votre partie.
            </p>

            <form
              method="dialog"
              className="flex flex-col gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="text"
                name="gameName"
                placeholder="Nom de la partie"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="input input-bordered w-full border-[#A8D8B9]"
                required
              />

              <textarea
                name="description"
                placeholder="Description (facultatif)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered w-full border-[#A8D8B9]"
                rows={3}
              ></textarea>

              <div className="modal-action flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    const modal = document.getElementById(
                      "my_modal_1"
                    ) as HTMLDialogElement;
                    modal.close();
                  }}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  className={`btn bg-[#4B4E6D] text-white hover:bg-[#7D5B3A] transition-all ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  onClick={handleCreateGame}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Créer la partie"
                  )}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-6 py-8 gap-8">
        <section className="flex-1 space-y-6">
          <h2 className="text-3xl font-bold text-[#4B4E6D] mb-4">
            Parties disponibles
          </h2>
          {isLoading ? (
            <p className="text-slate-600">Chargement des parties...</p>
          ) : null}

          {games.length === 0 && !isLoading && (
            <p className="text-slate-600">
              Aucune partie disponible pour le moment. Créez-en une !
            </p>
          )}
          {games.map((c) => (
            <article
              key={c.game.id}
              className="rounded-2xl border border-[#A8D8B9] bg-white/70 backdrop-blur-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#4B4E6D]">
                    Nom de la partie :{" "}
                    <span className="font-mono bg-slate-200 px-2 py-1 rounded-lg">
                      {c.game.name}
                    </span>{" "}
                  </h3>
                  <p className="text-lg text-slate-600">
                    Code de la partie :{" "}
                    <span className="px-2 py-1 rounded-lg select-text">
                      {c.game.code}
                    </span>
                  </p>
                  <p className="text-sm text-slate-600">
                    Partie créée par {c.game.createdBy}
                  </p>
                  <p className="text-sm text-slate-600">
                    État :{" "}
                    <span
                      className={
                        c.game.state === "WAITING"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }
                    >
                      {c.game.state === "WAITING"
                        ? "En attente de joueurs"
                        : "En cours"}
                    </span>
                  </p>
                </div>
                <Link
                  href={`/game/game-table?id=${c.game.id}`}
                  className="bg-[#7D5B3A] text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform"
                >
                  Rejoindre
                </Link>
              </div>

              <details className="mt-2 text-slate-500">
                <summary className="cursor-pointer">Description</summary>
                <p className="mt-2 text-sm">{c.game.description}</p>
              </details>
            </article>
          ))}
        </section>

        {/* SIDEBAR */}
        <aside className="w-full sm:w-72 bg-white/70 backdrop-blur-xl rounded-2xl border border-[#A8D8B9] p-6 shadow-md">
          <h3 className="text-xl font-semibold text-[#4B4E6D] mb-4">
            Rejoindre une partie
          </h3>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Code de la partie"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 focus:outline-none"
          />
          <button
            className="w-full bg-[#4B4E6D] text-white py-2 rounded-lg hover:scale-105 transition-transform"
            onClick={joinGame}
          >
            Rejoindre
          </button>
        </aside>
      </div>
    </main>
  );
}
