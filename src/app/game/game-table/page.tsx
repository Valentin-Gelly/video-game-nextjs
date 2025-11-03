"use client";

import GameCard from "@/app/component/GameCard";
import { useEffect, useState, useContext, useRef } from "react";
import Image from "next/image";
import RoleCard from "@/app/component/RoleCard";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { socket } from "@/server/socket";
import { GlobalContext } from "@/context/globalContext";
import GameDetail from "@/app/dashboard/game/[id]/page";
import { GameState, Role, Building } from "@/server/gameManager";

export default function GamePage() {
  const { userName, idUser } = useContext(GlobalContext);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isLobbyOpen, setIsLobbyOpen] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [deckCards, setDeckCards] = useState<any[]>([]);
  const [buildingCard, setBuildingCard] = useState<any[]>([]);
  const [gameState, setGameState] = useState<GameState>();
  const [gameId, setGameId] = useState<string>();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const joinedRef = useRef(false);
  const logs = useRef<string[]>([]);

  useEffect(() => {

    const id = searchParams.get("id");

    if (!id) {
      Swal.fire({
        icon: "error",
        title: "Impossible de trouver la partie",
        showConfirmButton: false,
        timer: 1500,
      });
      router.push("/game/lobby");
      return;
    }

    setGameId(id);
    if (gameId === "") {
      Swal.fire({
        icon: "error",
        title: "Impossible de trouver la partie",
        showConfirmButton: false,
        timer: 1500,
      });
      router.push("/game/lobby");
      return;
    }
    console.log("gameId", gameId, "ishost", isHost);
    setIsHost(searchParams.get("isHost") === "true");
    // 🔹 Écoute des mises à jour
    if (gameId && userName && !joinedRef.current) {
      joinedRef.current = true;
      socket.emit("joinGame", { gameId, playerName: userName, isHost }, (res) => {
        if (!res.ok) {
          console.error("Erreur joinGame:", res.error);
          return;
        }

        if (res.reconnect) {
          setGameId(gameId);
          setGameStarted(true);
          setIsLobbyOpen(false);
          setGameState(res.gameState);
          const role = res.gameState?.players.find((p: any) => p.id === socket.id)?.role;
          if (role) {
            setSelectedRole(role);
          }
        }
      });
    } else if (joinedRef.current) {
      setGameId(gameId);
      setGameStarted(true);
      setIsLobbyOpen(false);
    }
  }, [gameId, isHost, router, searchParams]); 

  socket.on("updatePlayers", (res) => {
    console.log("Mise à jour des joueurs :", res.players);
    setPlayers(res.players);
  });

  socket.on("gameClosed", () => {
    Swal.fire({
      icon: "info",
      title: "La partie a été fermée par l'hôte",
      showConfirmButton: false,
      timer: 1500,
    });
    router.push("/game/lobby");
  });

  socket.on("updateGameList", (data) => {
    console.log("🔄 Liste des parties mise à jour :", data)
  });

  socket.on("endRoleSelection", (res) => {
    console.log("Sélection des rôles terminée :", res);
    handlePlayTurn();
  });

  socket.on("log", (message) => {
    console.log("Log du serveur :", message);
    logs.current.push(message);
  });

  function getColorGradient(colorName: string | undefined) {
    if (!colorName) {
      return { top: "#4B4E6D", bottom: "#A8D8B9" }; // fallback
    }
    switch (colorName.toLowerCase()) {
      case "bleu":
        return { top: "#4B6CB7", bottom: "#182848" };
      case "jaune":
        return { top: "#FFEE58", bottom: "#F9A825" };
      case "vert":
        return { top: "#56ab2f", bottom: "#a8e063" };
      case "violet":
        return { top: "#8E2DE2", bottom: "#4A00E0" };
      case "rouge":
        return { top: "#FF416C", bottom: "#FF4B2B" };
      default:
        return { top: "#4B4E6D", bottom: "#A8D8B9" }; // fallback
    }
  }

  function getBuildingRole(colorName: string) {
    switch (colorName.toLowerCase()) {
      case "bleu":
        return "Évêque";
      case "jaune":
        return "Roi";
      case "verte":
        return "Marchand";
      case "violet":
        return "Mystique";
      case "rouge":
        return "Condottiere";
      default:
        return "neutre";
    }
  }

  socket.on("gameStarted", () => {
    setGameStarted(true);
    setIsLobbyOpen(false);
  });

  socket.on("gameState", (res) => {
    setGameState(res);
  });

  // 🔹 Fonction pour démarrer la partie (uniquement hôte)
  const handleStartGame = () => {
    socket.emit("startGame", { gameId }, (res: { ok: boolean }) => {
      if (res.ok) {
        setIsLobbyOpen(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur lors de la fermeture de la partie",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  const handleChooseRole = (role: Role) => {
    socket.emit("chooseRole", { gameId, role }, (res: any) => {
      if (!res.ok) Swal.fire("Erreur", res.error, "error");
      else {
        console.log("Rôle choisi :", role);
        setSelectedRole(role)
      };
    });
  };

  const handlePlayCard = (card: Building) => {
    console.log("Jouer la carte :", card);
    const player = gameState?.players.find((p: any) => p.id === idUser);
    if (!player) return;
    socket.emit("playerAction", { gameId, idUser, action: 'build', cardToKeep: card }, (res: any) => {
      if (!res.ok) Swal.fire("Erreur", res.error, "error");
    });
  };

  const handleEndTurn = () => {
    socket.emit("endTurn", { gameId, idUser }, (res: any) => {
      if (!res.ok) Swal.fire("Erreur", res.error, "error");
      setSelectedRole(null);
    });
  };

  const handlePlayTurn = () => {
    let role = gameState?.players?.find(p => p.id === socket.id)?.role?.name;
    console.log("handlePlayTurn for role:", role);
    if (gameState?.currentPlayerId !== socket.id && role) return;
    Swal.fire({
      icon: "info",
      title: "C'est à votre tour de jouer !",
      showConfirmButton: false,
      timer: 1500,
    });
    console.log("Rôle sélectionné pour l'action spéciale :", role);
    if (role === "Assassin") {
      Swal.fire({
        title: "Choisissez un rôle à assassiner",
        input: "select",
        inputOptions: gameState?.rolesPool.reduce((options: any, r: Role) => {
          options[r.name] = r.name;
          return options;
        }, {}) || {},
        inputPlaceholder: "Sélectionnez un rôle",
        showCancelButton: true,
        inputValidator: (value) => {
          return new Promise((resolve) => {
            if (value) {
              resolve("");
              socket.emit("playerAction", { gameId, playerId: socket.id, roleSpecial: 'assassinate', targetRole: value }, (res: any) => {
                if (!res.ok) Swal.fire("Erreur", res.error, "error");
              });
            } else {
              resolve("Vous devez choisir un rôle à assassiner.");
            }
          });
        }
      });
    } else if (role === "Magicien") {
      Swal.fire({
        title: "Choisissez une action spéciale",
        input: "select",
        inputOptions: {
          "ÉchangerMain": "Échanger votre main avec un autre joueur",
          "PrendreCartes": "Prendre 2 cartes de la pioche"
        },
        inputPlaceholder: "Sélectionnez une action",
        showCancelButton: true,
        inputValidator: (value) => {
          return new Promise((resolve) => {
            if (value) {
              if (value === "ÉchangerMain") {
                Swal.fire({
                  title: "Choisissez un joueur avec qui échanger votre main",
                  input: "select",
                  inputOptions: gameState?.players.reduce((options: any, p) => {
                    if (p.id !== socket.id) options[p.id] = p.name;
                    return options;
                  }, {}) || {},
                  inputPlaceholder: "Sélectionnez un joueur",
                  showCancelButton: false,
                  inputValidator: (playerValue) => {
                    return new Promise((resolve) => {
                      resolve("");
                      socket.emit("playerAction", { gameId, playerId: socket.id, roleSpecial: 'swpaHand', playerTargeted: playerValue }, (res: any) => {
                        if (!res.ok) Swal.fire("Erreur", res.error, "error");
                      });

                    });
                  }
                });
              } else if (value === "PrendreCartes") {
                socket.emit("playerAction", { gameId, playerId: socket.id, roleSpecial: 'swapDeck' }, (res: any) => {
                  if (!res.ok) Swal.fire("Erreur", res.error, "error");
                });
              }
              resolve("");
            } else {
              resolve("Vous devez choisir une action spéciale.");
            }
          });
        }
      });
    }
    else if (role === "Voleur") {
      Swal.fire({
        title: "Choisissez un rôle à voler",
        input: "select",
        inputOptions: gameState?.rolesPool.reduce((options: any, r: Role) => {
          options[r.name] = r.name;
          return options;
        }, {}) || {},
        inputPlaceholder: "Sélectionnez un rôle",
        showCancelButton: true,
        inputValidator: (value) => {
          return new Promise((resolve) => {
            if (value) {
              resolve("");
              socket.emit("playerAction", { gameId, playerId: socket.id, roleSpecial: 'Voleur', targetRole: value }, (res: any) => {
                if (!res.ok) Swal.fire("Erreur", res.error, "error");
              });
            } else {
              resolve("Vous devez choisir un rôle à voler.");
            }
          });
        }
      });
    }
    else if (role === "Marchand") {
      socket.emit("playerAction", { gameId, playerId: socket.id, action: 'roleSpecial', actionDetail: 'Marchand' }, (res: any) => {
        if (!res.ok) Swal.fire("Erreur", res.error, "error");
      });
    } else if (role === "Architecte") {
      socket.emit("playerAction", { gameId, playerId: socket.id, action: 'roleSpecial', actionDetail: 'Architecte' }, (res: any) => {
        if (!res.ok) Swal.fire("Erreur", res.error, "error");
      });
    } else if (role === "Roi") {
      socket.emit("playerAction", { gameId, playerId: socket.id, action: 'roleSpecial', actionDetail: 'Roi' }, (res: any) => {
        if (!res.ok) Swal.fire("Erreur", res.error, "error");
      });
    }
  };

  const leaveGame = (playerId: string) => {
    socket.emit(
      "leaveGame",
      { gameId, playerId: socket.id },
      (res: { ok: boolean; error?: string }) => {
        if (res.ok) {
          router.push("/game/lobby");
          setIsLobbyOpen(false);
          return () => {
            socket.off("joinGame");
            socket.off("updatePlayers");
            socket.off("gameStarted");
          }
        } else {
          if (res.error === "Game not found") {
            router.push("/game/lobby");
            setIsLobbyOpen(false);
            return () => {
              socket.off("joinGame");
              socket.off("updatePlayers");
              socket.off("gameStarted");
            };
          }
          Swal.fire({
            icon: "error",
            title: "Erreur lors de la fermeture de la partie",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    );
  };

  const closeGame = () => {
    socket.emit(
      "closeGame",
      { gameId },
      (res: { ok: boolean; error?: string }) => {
        if (res.ok) {
          router.push("/game/lobby");
          setIsLobbyOpen(false);
          return () => {
            socket.off("joinGame");
            socket.off("updatePlayers");
            socket.off("gameStarted");
          };
        } else {
          if (res.error === "Game not found") {
            router.push("/game/lobby");
            setIsLobbyOpen(false);
            return () => {
              socket.off("joinGame");
              socket.off("updatePlayers");
              socket.off("gameStarted");
            };
          }
          Swal.fire({
            icon: "error",
            title: "Erreur lors de la fermeture de la partie",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    );
  };

  return (
    <main className="min-h-screen  bg-[#C2B280]/20 overflow-hidden">
      {isLobbyOpen && (
        <dialog open className="modal">
          <div className="modal-box bg-white rounded-2xl shadow-lg border border-[#A8D8B9] text-[#4B4E6D]">
            <h2 className="text-2xl font-bold mb-4">Lobby de la partie</h2>
            <p className="mb-4">Joueurs connectés :</p>

            <ul className="mb-4 space-y-2">
              {players.length > 0 ? (
                players.map((p, i) => (
                  <li
                    key={i}
                    className="bg-[#C2B280]/20 rounded-lg px-4 py-2 border border-[#A8D8B9]"
                  >
                    {p.name}
                  </li>
                ))
              ) : (
                <p className="text-slate-500">En attente de joueurs...</p>
              )}
            </ul>

            <div className="flex justify-end gap-4">
              {isHost && (
                <button
                  onClick={handleStartGame}
                  className="btn bg-[#4B4E6D] text-white hover:bg-[#7D5B3A]"
                  disabled={players.length < 2}
                >
                  Lancer la partie
                </button>
              )}
              {isHost && (
                <button
                  onClick={() => closeGame()}
                  className="btn btn-ghost border border-[#A8D8B9]"
                >
                  Fermer la partie
                </button>)}
              {!isHost && (
                <button
                  onClick={() => leaveGame(idUser!)}
                  className="btn btn-ghost border border-[#A8D8B9]"
                >
                  Quitter
                </button>
              )}
            </div>
          </div>
        </dialog>
      )}
      {
        gameState?.gameStep === "roleSelection" && !selectedRole && gameState?.currentPlayerId == socket.id && (
          <dialog open className="modal">
            <div className="modal-box bg-white rounded-2xl shadow-lg border border-[#A8D8B9] text-[#4B4E6D] w-1/2 max-w-5xl">
              <h2 className="text-2xl font-bold mb-4">Choisissez votre rôle</h2>
              <div className="grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto ">
                {gameState?.rolesPool.map((role: Role, idx: number) => {
                  return (
                    <div
                      key={idx}
                      className="cursor-pointer"
                    >
                      <RoleCard
                        name={role.name}
                        description={role.description}
                        backgroundColors={getColorGradient(role.color)}
                        choiceHandler={() => handleChooseRole(role)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </dialog>
        )
      }
      {
        !isLobbyOpen && gameStarted && (
          <>
            <div
              id="gameSpace"
              className="w-full h-[75vh] bg-[#C2B280]/20 flex mt-[5vh]"
            >
              <div className="flex flex-col items-center space-y-4 w-1/4">
                {gameState?.players
                  .slice(0, Math.ceil(gameState.players.length / 2)) // moitié gauche
                  .map((p, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center bg-[#00000033] rounded-lg p-2 w-full"
                    >
                      <p className="text-white font-bold mb-1">{p.name}</p>
                      <div className="flex flex-wrap gap-4 space-x-2 overflow-x-auto">
                        {p.city.map((card, cardIdx) => (
                          <GameCard
                            key={cardIdx}
                            id={cardIdx}
                            name={card.name}
                            description={card.description}
                            price={card.cost.toString()}
                            backgroundColors={getColorGradient(card.color)}
                            isPlayed={true}
                            type={getBuildingRole(card.color)}
                            isPlayable={false}
                            canBeBuilded={false}
                            isCondotiere={p.role?.name === "Condottiere"}
                            onDestroyHandler={() => {
                              socket.emit("destroyBuilding", { gameId, playerId: socket.id, card }, (res: any) => {
                                if (!res.ok) Swal.fire("Erreur", res.error, "error");
                              });
                            }}
                          />
                        ))}
                      </div>
                      {/* Ressources */}
                      <div className="flex space-x-2 mt-2">
                        <div className="flex items-center space-x-1">
                          <p className="text-white">{p.hand.length}</p>
                          <Image
                            src="/game/flash-cards.png"
                            alt="cartes"
                            width={24}
                            height={20}
                          />
                        </div>
                        <div className="flex items-center space-x-1">
                          <p className="text-white">{p.gold}</p>
                          <Image
                            src="/game/coin.png"
                            alt="pièces"
                            width={24}
                            height={20}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Colonne centrale */}
              <div className="flex flex-col justify-between items-center flex-end space-y-6 w-1/2 ">
                {/* Rôle en cours */}
                {gameState?.currentRole && (
                  <div>
                    <h2 className="text-white font-bold mb-2 text-center">
                      C&apos;est au tour du :{" "}
                    </h2>
                    <RoleCard
                      name={gameState?.currentRole?.name}
                      description={""}
                      backgroundColors={getColorGradient(gameState?.currentRole.color)}
                    />
                  </div>
                )}
                {/* Joueur principal */}
                <div className="flex flex-col items-center bg-[#00000033] rounded-lg p-4 w-5/6">
                  <p className="text-white font-bold mb-2">Votre ville : </p>
                  <div className="flex flex-wrap  space-x-2 overflow-x-auto">
                    {gameState?.players?.find(p => p.id === socket.id)?.city
                      .map((card, cardIdx) => (
                        <GameCard
                          key={cardIdx}
                          id={cardIdx}
                          name={card.name}
                          description={card.description}
                          price={card.cost.toString()}
                          backgroundColors={getColorGradient(card.color)}
                          isPlayed={true}
                          type={getBuildingRole(card.color)}
                          isPlayable={true}
                          canBeBuilded={true}
                          isCondotiere={gameState?.players?.find(p => p.id === socket.id)?.role?.name === "Condottiere"}
                          onDestroyHandler={() => {
                            socket.emit("destroyBuilding", { gameId, playerId: socket.id, card }, (res: any) => {
                              if (!res.ok) Swal.fire("Erreur", res.error, "error");
                            });
                          }}
                        />
                      ))}
                  </div>
                </div>
              </div>

              {/* Colonne droite */}
              <div className="flex flex-col items-center space-y-4 w-1/4">
                {gameState?.players
                  .slice(Math.ceil(gameState.players.length / 2)) // moitié droite
                  .map((p, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center bg-[#00000033] rounded-lg p-2 w-full"
                    >
                      <p className="text-white font-bold mb-1">{p.name}</p>
                      <div className="flex flex-wrap gap-4 space-x-2 overflow-x-auto">
                        {p.city.map((card, cardIdx) => (
                          <GameCard
                            key={cardIdx}
                            id={cardIdx}
                            name={card.name}
                            description={card.description}
                            price={card.cost.toString()}
                            backgroundColors={getColorGradient(card.color)}
                            isPlayed={true}
                            type={getBuildingRole(card.color)}
                            isPlayable={false}
                            canBeBuilded={false}
                            isCondotiere={p.role?.name === "Condottiere"}
                          />
                        ))}
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <div className="flex items-center space-x-1">
                          <p className="text-white">{p.hand.length}</p>
                          <Image
                            src="/game/flash-cards.png"
                            alt="cartes"
                            width={24}
                            height={20}
                          />
                        </div>
                        <div className="flex items-center space-x-1">
                          <p className="text-white">{p.gold}</p>
                          <Image
                            src="/game/coin.png"
                            alt="pièces"
                            width={24}
                            height={20}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="absolute bottom-0 w-full flex items-end justify-around overflow-hidden">
              <div>
                {selectedRole && (
                  <RoleCard
                    name={gameState?.players?.find(p => p.id === socket.id)?.role?.name}
                    description={gameState?.players?.find(p => p.id === socket.id)?.role?.description}
                    backgroundColors={getColorGradient(gameState?.players?.find(p => p.id === socket.id)?.role?.color)}
                  />
                )}
              </div>

              <div className="flex w-4/7 justify-center space-x-[-32px] relative">
                <div className="flex w-2/3 justify-center space-x-[-32px] relative">
                  {gameState?.players?.find(p => p.id === socket.id)?.hand ? (
                    gameState?.players?.find(p => p.id === socket.id)?.hand
                      .map((card, cardIdx) => (
                        <GameCard
                          key={cardIdx}
                          id={cardIdx}
                          name={card.name}
                          description={card.description}
                          price={card.cost.toString()}
                          backgroundColors={getColorGradient(card.color)}
                          isPlayed={false}
                          type={getBuildingRole(card.color)}
                          isPlayable={gameState?.currentPlayerId === socket.id}
                          canBeBuilded={card.cost <= gameState?.players?.find(p => p.id === socket.id)?.gold!}
                          handleBuildCard={() => handlePlayCard(card)}
                          onDestroyHandler={() => {
                            socket.emit("playerAction", { gameId, playerId: socket.id, roleSpecial: 'roleSpecial', role: 'Condotiere' }, (res: any) => {
                              if (!res.ok) Swal.fire("Erreur", res.error, "error");
                            });
                          }}
                        />
                      ))
                  ) : (
                    <p className="text-white">Chargement des cartes...</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-row items-center justify-between ml-12">
                  <p className="h-fit text-xl text-white">{gameState?.players?.find(p => p.id === socket.id)?.hand.length}</p>
                  <Image
                    src={"/game/flash-cards.png"}
                    alt="$"
                    width={50}
                    height={40}
                    priority
                    className="object-contain"
                  ></Image>
                </div>
                <div className="flex flex-row items-center justify-between ml-12">
                  <p className="h-fit text-xl text-white">{gameState?.players?.find(p => p.id === socket.id)?.gold}</p>
                  <Image
                    src={"/game/coin.png"}
                    alt="$"
                    width={50}
                    height={40}
                    priority
                    className="object-contain"
                  ></Image>
                </div>
              </div>
              {
                gameState?.players?.find(p => p.id === socket.id)?.id === gameState?.currentPlayerId && (
                  <div className="flex flex-col">
                    <button
                      onClick={handleEndTurn}
                      className="btn bg-[#4B4E6D] text-white hover:bg-[#7D5B3A] mb-2"
                    >
                      Terminer mon tour
                    </button>
                  </div>
                )
              }
              <div>
                Liste des actions :
                <div className="h-40 w-64 overflow-y-auto bg-white/80 rounded-lg p-2 border border-[#A8D8B9]">
                  {logs.current.length === 0 ? (
                    <p className="text-slate-500">Aucune action pour le moment.</p>
                  ) : (
                    <ul className="space-y-2">
                      {logs.current.map((log, index) => (
                        <li key={index} className="text-sm text-slate-700">
                          {log}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

            </div>
          </>
        )}
    </main>
  );
}
