"use client";

import GameCard from "@/app/component/GameCard";
import { useEffect, useState, useContext, useRef, use } from "react";
import Image from "next/image";
import RoleCard from "@/app/component/RoleCard";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { socket } from "@/server/socket";
import { GlobalContext } from "@/context/globalContext";
import { GameState, Role, Building, Player, Game } from "@/server/gameManager";
import React from "react";
import BuildPopup from "@/app/component/BuildPopup";
import { showEndGamePopup } from "@/app/component/RankingPopup";
 
export default function GamePage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [gameId, setGameId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const context = useContext(GlobalContext);
  const idUser = context?.idUser;
  const userName = context?.userName;
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLobbyOpen, setIsLobbyOpen] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState>();
  const [selectedRole, setSelectedRole] = useState<Role>();
  const [turnStatus, setTurnStatus] = useState<string>('');
  const [game, setGame] = useState<Game>();
  console.log('turnStatus', turnStatus);
  const [isCondotierDestroyBuilding, setIsCondotierDestroyBuilding] = useState<boolean>(false);
  const [isBuildPopupOpen, setBuildPopupOpen] = useState(false);
  const joinedRef = useRef(false);
  const isHost = useRef(searchParams.get("isHost") === "true");
  const logs = useRef<string[]>([]);
  const [pageLoaded, setpageLoaded] = useState(false);


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

  useEffect(() => {
    console.log('changement id, router');
    setGameId(id);
    if (!id) {
      console.log("🔴 gameId est indéfini");
      Swal.fire({
        icon: "error",
        title: "Impossible de trouver la partie",
        showConfirmButton: false,
        timer: 1500,
      });
      router.push("/games/lobby");
      return;
    }
  }, [id, router]);

  useEffect(() => {
    console.log('changement gameId, userName, isHost.current', !gameId || !userName, idUser);
    if (!gameId || !userName) return;

    if (joinedRef.current) return;

    joinedRef.current = true;

    socket.emit("joinGame", { gameId, playerName: userName, idUser: idUser,  isHost }, (res: any) => {
      if (!res.ok) {
        console.error("Erreur joinGame:", res.error);
        return;
      }

      if (res.reconnect) {
        setGameStarted(true);
        setIsLobbyOpen(false);
        setGameState(res.gameState);
        const role = res.gameState?.players.find(
          (p: any) => p.id === socket.id
        )?.role;
        if (role) {
          setSelectedRole(role);
        }
      }
    });
  }, [gameId, userName, isHost, idUser]);

  useEffect(() => {
    console.log('turnStatus changed', turnStatus);
    switch (turnStatus) {
      case 'buildingCard':
        {
          setBuildPopupOpen(true);
          break;
        }
      case 'takeGoldOrDraw':
        Swal.fire({
          title: "Il vous faut maintenant jouer votre tour",
          showCancelButton: false,
          showConfirmButton: false,
          html: `
          <button id="takeGold" class="swal2-confirm swal2-styled">Prendre 2 pièces</button>
          <button id="drawCards" class="swal2-deny swal2-styled">Piocher 2 cartes</button>
          `,
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            const takeGoldBtn = Swal.getPopup()?.querySelector('#takeGold');
            const drawCardsBtn = Swal.getPopup()?.querySelector('#drawCards');
            takeGoldBtn?.addEventListener('click', () => {
              socket.emit("playerAction", {
                gameId,
                playerId: socket.id,
                action: "takeGold"
              }, (res: any) => {
                if (res.ok) {
                  Swal.close();
                  setTurnStatus('buildingCard');
                }
              });
              Swal.close();
            });
            drawCardsBtn?.addEventListener('click', () => {
              socket.emit("playerAction", {
                gameId,
                playerId: socket.id,
                action: "drawCards"
              }, (res: any) => {
                if (res.ok) {
                  Swal.close();
                  setTurnStatus('buildingCard');
                }
                Swal.close();
              });
            });
          }
        });
        break;
    }

  }, [turnStatus])

  useEffect(() => {
    if (pageLoaded) return;

    socket.on("updatePlayers", (res: any) => {
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
      router.push("/games/lobby");
    });

    socket.on("endRoleSelection", (res: any) => {
      console.log("Sélection des rôles terminée :", res);
      handlePlayTurn();
    });

    socket.on("log", (message) => {
      console.log("Log du serveur :", message);
      logs.current.push(message);
    });

    socket.on("gameStarted", () => {
      setGameStarted(true);
      setIsLobbyOpen(false);
    });

    socket.on("roundEnded", (res: any) => {
      setGameState(res);
      setSelectedRole(undefined);
      setTurnStatus('');
      Swal.fire({
        icon: "info",
        title: "Le tour est terminé !",
        showConfirmButton: false,
        timer: 1500,
      });
      socket.emit("startNextRound", { gameId }, (res: { ok: boolean }) => {
        if (!res.ok) {
          Swal.fire("Erreur", "Impossible de démarrer le tour suivant.", "error");
        }
      });
    });

    socket.on("announce", (message) => {
      Swal.fire({
        icon: "info",
        title: message,
        showConfirmButton: false,
        timer: 2000,
      });
    });

    socket.on("gameEnded", (res: any) => {
      setGame(res);
      console.log("gameEnded received :", res);
      Swal.fire({
        icon: "info",
        title: "La partie est terminée !",
        showConfirmButton: false,
        timer: 1500,
      });

      showEndGamePopup(res?.ranking);
    });

    socket.on("gameState", handleGameState);
    setpageLoaded(true);
  }, []);


  const handleGameState = (res: any) => {
    if (!res) return;
    if (res.gameState) return;
    if (res.phase === "ENDED") return;
    console.log("🌀 Nouveau gameState :", res);
    console.log(gameState?.gameStep === "roleSelection",
      !selectedRole,
      gameState?.currentPlayerId == socket.id)
    setGameState(res);
  };
  useEffect(() => {
    if (!gameState) return;

    const myRole =
      selectedRole ||
      gameState.players.find((p) => p.id === socket.id)?.role ||
      null;

    if (!myRole) {
      console.warn("⚠️ Aucun rôle trouvé pour le joueur au moment du tour");
      return;
    }

    // Si la partie est à l’étape du tour du joueur
    if (gameState.gameStep === "playerTurn" && turnStatus == '' &&  gameState.currentPlayerId === socket.id) {
      console.log("C'est votre tour de jouer avec le rôle :", myRole);
      handlePlayTurn();
    }
  }, [gameState, selectedRole]);

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
        setSelectedRole(role);
      }
    });
  };

  const handlePlayCard = (card: Building) => {
    console.log("Jouer la carte :", card);
    socket.emit(
      "playerAction",
      { gameId, playerId: socket.id, action: "build", cardToKeep: card },
      (res: any) => {
        if (!res.ok) Swal.fire("Erreur", res.error, "error");
      }
    );
  };

  const handleEndTurn = () => {
    socket.emit("endTurn", { gameId, playerId: socket.id }, (res: any) => {
      if (!res.ok) Swal.fire("Erreur", res.error, "error");
      setSelectedRole(undefined);
    });
  };

  const handlePlayTurn = () => {
    const isAlive = () => {
      const player = gameState?.players.find((p) => p.id === socket.id);
      return player?.isAlive !== false;
    };
    const isStool = () => {
      const player = gameState?.players.find((p) => p.id === socket.id);
      if (gameState?.stolenPlayerId === player?.id) {
        socket.emit("hasBeenStolen", { gameId, playerId: socket.id }, (res: any) => {
          if (!res.ok) Swal.fire("Erreur", res.error, "error");
        });
        return true;
      }
      return false;
    };
    if (gameState?.currentPlayerId === socket.id && selectedRole && !isStool()) {
      Swal.fire({
        icon: "info",
        title: "Vous n'avez plus d'argent, le voleur vous  choisie.",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (gameState?.currentPlayerId === socket.id && selectedRole && isAlive()) {
      Swal.fire({
        icon: "info",
        title: "C'est à votre tour de jouer !",
        showConfirmButton: false,
        timer: 1500,
      });
      if (selectedRole?.name === "Assassin" && isAlive()) {
        Swal.fire({
          icon: "info",
          title: "C'est à votre tour de jouer !",
          showConfirmButton: false,
          timer: 1500,
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          Swal.fire({
            title: "Choisissez un rôle à assassiner",
            input: "select",
            inputOptions:
              gameState?.rolesPool.reduce((options: any, r: Role) => {
                if (r.name !== "Assassin") { options[r.name] = r.name; }
                return options;
              }, {}) || {},
            inputPlaceholder: "Sélectionnez un rôle",
            showCancelButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            inputValidator: (value) => {
              if (!value) {
                return "Vous devez choisir un rôle à assassiner.";
              }
              return null;
            },
            preConfirm: (value) => {
              return new Promise<void>((resolve, reject) => {
                socket.emit(
                  "playerAction",
                  {
                    gameId,
                    playerId: socket.id,
                    action: "roleSpecial",
                    actionDetail: "Assassin",
                    targetRole: value,
                  },
                  (res: any) => {
                    if (!res.ok) {
                      Swal.showValidationMessage(res.error);
                      reject();
                    } else {
                      setTurnStatus("takeGoldOrDraw");
                      resolve();
                    }
                  }
                );
              });
            },
          });
        })
      } else if (selectedRole?.name === "Magicien" && isAlive()) {
        Swal.fire({
          title: "Choisissez une action spéciale",
          input: "select",
          inputOptions: {
            changeHand: "Échanger votre main avec un autre joueur",
            PrendreCartes: "Prendre 2 cartes de la pioche",
          },
          inputPlaceholder: "Sélectionnez une action",
          showCancelButton: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          inputValidator: (value) => {
            return new Promise((resolve) => {
              if (value) {
                if (value === "changeHand") {
                  Swal.fire({
                    title: "Choisissez un joueur avec qui échanger votre main",
                    input: "select",
                    inputOptions:
                      gameState?.players.reduce((options: any, p) => {
                        if (p.id !== socket.id) options[p.id] = p.name;
                        return options;
                      }, {}) || {},
                    inputPlaceholder: "Sélectionnez un joueur",
                    showCancelButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    inputValidator: (playerValue) => {
                      return new Promise((resolve) => {
                        resolve("");
                        socket.emit(
                          "playerAction",
                          {
                            gameId,
                            playerId: socket.id,
                            action: "roleSpecial",
                            actionDetail: "swapHand",
                            playerTargeted: playerValue,
                          },
                          (res: any) => {
                            if (!res.ok) Swal.fire("Erreur", res.error, "error");
                            else {
                              setTurnStatus("takeGoldOrDraw");
                            }
                          }
                        );
                      });
                    },
                  });
                } else if (value === "PrendreCartes") {
                  socket.emit(
                    "playerAction",
                    { gameId, playerId: socket.id, action: "roleSpecial", actionDetail: "swapDeck" },
                    (res: any) => {
                      if (!res.ok) Swal.fire("Erreur", res.error, "error");
                      else {
                        setTurnStatus("takeGoldOrDraw");
                      }
                    }
                  );
                }
                resolve("");
              } else {
                resolve("Vous devez choisir une action spéciale.");
              }
            });
          },
        });
      } else if (selectedRole?.name === "Voleur" && isAlive()) {
        Swal.fire({
          title: "Choisissez un rôle à voler",
          input: "select",
          inputOptions:
            gameState?.rolesPool.reduce((options: any, r: Role) => {
              if (r.name !== "Voleur" && r.name !== "Assassin")
                options[r.name] = r.name;
              return options;
            }, {}) || {},
          inputPlaceholder: "Sélectionnez un rôle",
          showCancelButton: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          inputValidator: (value) => {
            if (!value) {
              return "Vous devez choisir un rôle à Voler.";
            }
            return null;
          },
          preConfirm: (value) => {
            return new Promise<void>((resolve, reject) => {
              if (value) {
                socket.emit(
                  "playerAction",
                  {
                    gameId,
                    action: "roleSpecial",
                    playerId: socket.id,
                    actionDetail: "Voleur",
                    targetRole: value,
                  },
                  (res: any) => {
                    if (!res.ok) {
                      Swal.showValidationMessage(res.error);
                      reject();
                    }
                    else {
                      setTurnStatus("takeGoldOrDraw");
                      resolve();
                    }
                  }
                );
              } else {
                reject();
              }
            });
          },
        });
      } else if (selectedRole?.name === "Marchand" && isAlive()) {
        socket.emit(
          "playerAction",
          {
            gameId,
            playerId: socket.id,
            action: "roleSpecial",
            actionDetail: "Marchand",
          },
          (res: any) => {
            if (!res.ok) {
              Swal.showValidationMessage(res.error);
            }
            else {
              setTurnStatus("takeGoldOrDraw");
            }
          }
        );
      } else if (selectedRole?.name === "Évêque" && isAlive()) {
        socket.emit(
          "playerAction",
          {
            gameId,
            playerId: socket.id,
            action: "roleSpecial",
            actionDetail: "Évêque",
          },
          (res: any) => {
            if (!res.ok) {
              Swal.showValidationMessage(res.error);
            }
            else {
              setTurnStatus("takeGoldOrDraw");
            }
          }
        );
      } else if (selectedRole?.name === "Architecte" && isAlive()) {
        socket.emit(
          "playerAction",
          {
            gameId,
            playerId: socket.id,
            action: "roleSpecial",
            actionDetail: "Architecte",
          },
          (res: any) => {
            if (!res.ok) {
              Swal.showValidationMessage(res.error);
            }
            else {
              setTurnStatus("takeGoldOrDraw");
            }
          }
        );
      } else if (selectedRole?.name === "Roi" && isAlive()) {
        socket.emit(
          "playerAction",
          {
            gameId,
            playerId: socket.id,
            action: "roleSpecial",
            actionDetail: "Roi",
          },
          (res: any) => {
            if (!res.ok) {
              Swal.showValidationMessage(res.error);
            }
            else {
              setTurnStatus("takeGoldOrDraw");
            }
          }
        );
      } else if (selectedRole?.name === "Condottiere" && isAlive()) {
        Swal.fire({
          icon: "info",
          title: "Souhaitez-vous détruire un bâtiment ?",
          showCancelButton: true,
          confirmButtonText: "Oui",
          cancelButtonText: "Non",
        }).then((result) => {
          if (result.isConfirmed) {
            console.log('end turn condottiere no destroy building sdfsdf');
          } else {
            setIsCondotierDestroyBuilding(true);
            console.log('end turn condottiere no destroy building');
          }
        }); 
      }
    } else if (gameState?.currentPlayerId === socket.id && selectedRole && !isAlive()) {
      Swal.fire({
        icon: "info",
        title: "Vous êtes mort ce tour-ci et ne pouvez pas jouer.",
        showConfirmButton: false,
        timer: 1500,
      });
      setTimeout(() => {
        handleEndTurn();
      }, 1600);
    }
  };

  const leaveGame = (playerId: string) => {
    socket.emit(
      "leaveGame",
      { gameId, playerId: socket.id },
      (res: { ok: boolean; error?: string }) => {
        if (res.ok) {
          router.push("/games/lobby");
          setIsLobbyOpen(false);
          return () => {
            socket.off("joinGame");
            socket.off("updatePlayers");
            socket.off("gameStarted");
          };
        } else {
          if (res.error === "Game not found") {
            router.push("/games/lobby");
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
          router.push("/games/lobby");
          setIsLobbyOpen(false);
          return () => {
            socket.off("joinGame");
            socket.off("updatePlayers");
            socket.off("gameStarted");
          };
        } else {
          if (res.error === "Game not found") {
            router.push("/games/lobby");
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
    <main className="pt-[12vh] bg-[#C2B280]/20 overflow-hidden">
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
              {isHost.current && (
                <button
                  onClick={handleStartGame}
                  className="btn bg-[#4B4E6D] text-white hover:bg-[#7D5B3A]"
                  disabled={players.length < 2}
                >
                  Lancer la partie
                </button>
              )}
              {isHost.current && (
                <button
                  onClick={() => closeGame()}
                  className="btn btn-ghost border border-[#A8D8B9]"
                >
                  Fermer la partie
                </button>
              )}
              {!isHost.current && (
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
      {gameState?.gameStep === "roleSelection" &&
        !selectedRole &&
        gameState?.currentPlayerId == socket.id && (
          <dialog open className="modal">
            <div className="modal-box bg-white rounded-2xl shadow-lg border border-[#A8D8B9] text-[#4B4E6D] w-1/2 max-w-5xl">
              <h2 className="text-2xl font-bold mb-4">Choisissez votre rôle</h2>
              <div className="grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto ">
                {gameState?.rolesPool.map((role: Role, idx: number) => {
                  return (
                    <div key={idx} className="cursor-pointer">
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
        )}
      {!isLobbyOpen && gameStarted && (
        <>
          <BuildPopup
            isOpen={isBuildPopupOpen}
            onClose={() => setBuildPopupOpen(false)}
            gameState={gameState}
            socket={socket}
            handlePlayCard={handlePlayCard}
            getColorGradient={getColorGradient}
            getBuildingRole={getBuildingRole}
          />

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
                          isCondottiere={selectedRole?.name === "Condottiere" && p.role?.name !== "Évêque"}
                          onDestroyHandler={() => {
                            socket.emit(
                              "playerAction",
                              {
                                gameId,
                                playerId: socket.id,
                                action: "roleSpecial",
                                actionDetail: "Condottiere_destroy",
                                playerTargeted: p,
                                targetCard: card,
                              },
                              (res: any) => {
                                if (res.ok) {
                                  setIsCondotierDestroyBuilding(false);
                                  setTurnStatus("takeGoldOrDraw");
                                } else {
                                  Swal.showValidationMessage(res.error);
                                }
                              }
                            );
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

            <div className="flex flex-col justify-around items-center flex-end w-1/2 ">
              {gameState?.currentRole && (
                <div>
                  <h2 className="text-white font-bold mb-2 text-center">
                    C&apos;est au tour du :{" "}
                  </h2>
                  <RoleCard
                    name={gameState?.currentRole?.name}
                    description={""}
                    backgroundColors={getColorGradient(
                      gameState?.currentRole.color
                    )}
                    choiceHandler={() => {
                      console.log("Rôle en cours cliqué");
                    }}
                  />
                </div>
              )}
              {!gameState?.currentRole && (
                <div>
                  <h2 className="text-white font-bold mb-2 text-center">
                    En attente du prochain rôle...
                  </h2>
                </div>
              )}
              {/* Joueur principal */}
              <div className="flex flex-col items-center bg-[#00000033] rounded-lg p-4 w-5/6">
                <p className="text-white font-bold mb-2">Votre ville : </p>
                <div className="flex flex-wrap  space-x-2 overflow-x-auto">
                  {gameState?.players
                    ?.find((p) => p.id === socket.id)
                    ?.city.map((card, cardIdx) => (
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
                          isCondottiere={p.role?.name === "Condottiere"}
                          onDestroyHandler={() => {
                            socket.emit(
                              "playerAction",
                              {
                                gameId,
                                playerId: socket.id,
                                action: "roleSpecial",
                                actionDetail: "Condottiere_destroy",
                                playerTargeted: p,
                                targetCard: card,
                              },
                              (res: any) => {
                                console.log(res.ok);
                                if (res.ok) {
                                  setTurnStatus("takeGoldOrDraw");
                                } else {
                                  Swal.showValidationMessage(res.error);
                                }
                              }
                            );
                          }}
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
                  name={
                    gameState?.players?.find((p) => p.id === socket.id)?.role
                      ?.name
                  }
                  description={
                    gameState?.players?.find((p) => p.id === socket.id)?.role
                      ?.description
                  }
                  backgroundColors={getColorGradient(
                    gameState?.players?.find((p) => p.id === socket.id)?.role
                      ?.color
                  )}
                />
              )}
            </div>

            <div className="flex w-4/7 justify-center space-x-[-32px] relative">
              <div className="flex w-2/3 justify-center space-x-[-32px] relative">
                {gameState?.players?.find((p) => p.id === socket.id)?.hand ? (
                  gameState?.players
                    ?.find((p) => p.id === socket.id)
                    ?.hand.map((card, cardIdx) => (
                      <GameCard
                        key={cardIdx}
                        id={cardIdx}
                        name={card.name}
                        description={card.description}
                        price={card.cost.toString()}
                        backgroundColors={getColorGradient(card.color)}
                        isPlayed={false}
                        type={getBuildingRole(card.color)}
                      />
                    ))
                ) : (
                  <p className="text-white">Chargement des cartes...</p>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row items-center justify-between ml-12">
                <p className="h-fit text-xl text-white">
                  {
                    gameState?.players?.find((p) => p.id === socket.id)?.hand
                      .length
                  }
                </p>
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
                <p className="h-fit text-xl text-white">
                  {gameState?.players?.find((p) => p.id === socket.id)?.gold}
                </p>
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
            {gameState?.players?.find((p) => p.id === socket.id)?.id ===
              gameState?.currentPlayerId && (
                <div className="flex flex-col">
                  {
                    isCondotierDestroyBuilding && selectedRole?.name === "Condottiere" && (
                      <button
                        onClick={() => {
                          setIsCondotierDestroyBuilding(false);
                          setTurnStatus("takeGoldOrDraw");
                        }}
                        className="btn bg-[#4B4E6D] text-white hover:bg-[#7D5B3A] mb-2"
                      >
                        Ne pas détruire de bâtiment
                      </button>
                    )
                  }
                  <button
                    onClick={handleEndTurn}
                    className="btn bg-[#4B4E6D] text-white hover:bg-[#7D5B3A] mb-2"
                  >
                    Terminer mon tour
                  </button>
                </div>
              )}
            <div>
              Liste des actions :
              <div className="h-40 w-64 overflow-y-auto bg-white/80 rounded-lg p-2 border border-[#A8D8B9]">
                {logs.current.length === 0 ? (
                  <p className="text-slate-500">
                    Aucune action pour le moment.
                  </p>
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
