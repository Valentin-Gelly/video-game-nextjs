"use client";

import GameCard from "@/app/component/GameCard";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import Image from "next/image";
import RoleCard from "@/app/component/RoleCard";

let socket: ReturnType<typeof io> | null = null;

export default function GamePage({
  gameId,
  playerId,
  name,
  description,
  price,
}: {
  gameId: string;
  playerId: number;
  name: string;
  description: string;
  price: string;
}) {
  const [state, setState] = useState<any>(null);

  const [role, setRole] = useState<any>(null);
  const [deckCards, setDeckCards] = useState<any>([]);
  const [buildingCard, setBuildingCard] = useState<any>([]);

  useEffect(() => {
    setRole({
      description:
        "Le Voleur peut choisir de voler un personnage, sauf l'Assassin ; lorsque le joueur dévoile son personnage, il donne ses pièces d'or au Voleur. Ceci se fait avant la perception par le joueur de ses pièces d'or du tour.",
      name: "Le Voleur",
      color: "blanc",
    });

    setDeckCards([
      { name: "Taverne", cost: 1, quantity: 5, description: "", color: "bleu" },
      {
        name: "Échoppe",
        cost: 2,
        quantity: 3,
        description: "",
        color: "jaune",
      },
      { name: "Marché", cost: 2, quantity: 4, description: "", color: "verte" },
      {
        name: "Comptoir",
        cost: 3,
        quantity: 3,
        description: "",
        color: "violet",
      },
      { name: "Port", cost: 4, quantity: 3, description: "", color: "rouge" },
      {
        name: "Hôtel de ville",
        cost: 5,
        quantity: 2,
        description: "",
        color: "bleu",
      },
      {
        name: "Cour des miracles",
        cost: 2,
        quantity: 1,
        description:
          "Compte comme un quartier de la couleur de votre choix pour le décompte final.",
        color: "violet",
      },
      {
        name: "Donjon",
        cost: 3,
        quantity: 2,
        description: "Ne peut pas être détruit par le Condottiere.",
        color: "violet",
      },
      {
        name: "Laboratoire",
        cost: 5,
        quantity: 1,
        description:
          "Une fois par tour, défaussez une carte pour gagner 1 pièce d’or.",
        color: "violet",
      },
    ]);
    // 👇 Exemple de cartes construites (buildingCard)
    setBuildingCard([
      {
        name: "Tour de guet",
        cost: 1,
        description: "Protège la cité.",
        color: "rouge",
      },
      {
        name: "Tour de guet",
        cost: 1,
        description: "Protège la cité.",
        color: "rouge",
      },
      {
        name: "Tour de guet",
        cost: 1,
        description: "Protège la cité.",
        color: "rouge",
      },
      {
        name: "Tour de guet",
        cost: 1,
        description: "Protège la cité.",
        color: "rouge",
      },
      {
        name: "Tour de guet",
        cost: 1,
        description: "Protège la cité.",
        color: "rouge",
      },

      {
        name: "Chapelle",
        cost: 2,
        description: "Lieu de prière.",
        color: "bleu",
      },
      {
        name: "Tour de guet",
        cost: 1,
        description: "Protège la cité.",
        color: "rouge",
      },
    ]);
  }, []); // <- empty dependency array = run once

  // 🧠 Ce useEffect se déclenche chaque fois que deckCards change :
  useEffect(() => {
    console.log("deckCards mis à jour :", deckCards);
  }, [deckCards]);

  function getColorGradient(colorName: string) {
    switch (colorName.toLowerCase()) {
      case "bleu":
        return { top: "#4B6CB7", bottom: "#182848" };
      case "jaune":
        return { top: "#FFEE58", bottom: "#F9A825" };
      case "verte":
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

  /*
  useEffect(() => {
    // connect to our socket endpoint
    if (!socket) {
      socket = io({ path: "/api/socket_io" });
    }

    socket.emit("joinGame", gameId);

    socket.on("gameStarted", (payload: any) => {
      console.log("gameStarted", payload);
      setState(payload);
    });

    return () => {
      socket?.off("gameStarted");
    };
  }, [gameId]);

  const handleStart = () => {
    socket?.emit("startGame", {
      gameId,
      playerIds: [
      ],
    });
  };
  */

  return (
    <main className="min-h-screen  bg-[#C2B280]/20 overflow-hidden">
      <div
        id="gameSpace"
        className="w-full h-[75vh] bg-[#C2B280]/20 flex mt-[5vh]"
      >
        {/* Colonne gauche */}
        <div className="flex flex-col items-center space-y-4 w-1/4">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-center bg-[#00000033] rounded-lg p-2 w-full"
            >
              <p className="text-white font-bold mb-1">Joueur {idx + 1}</p>
              {/* Cartes construites */}
              <div className="flex flex-wrap gap-4 space-x-2 overflow-x-auto">
                {buildingCard.map((card, cardIdx) => (
                  <GameCard
                    key={cardIdx}
                    id={cardIdx}
                    name={card.name}
                    description={card.description}
                    price={card.cost.toString()}
                    backgroundColors={getColorGradient(card.color)}
                    isPlayed={true}
                    type={getBuildingRole(card.color)}
                  />
                ))}
              </div>
              {/* Ressources */}
              <div className="flex space-x-2 mt-2">
                <div className="flex items-center space-x-1">
                  <p className="text-white">9</p>
                  <Image
                    src="/game/flash-cards.png"
                    alt="cartes"
                    width={24}
                    height={20}
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <p className="text-white">9</p>
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
          {role && (
            <div>
              <h2 className="text-white font-bold mb-2 text-center">
                C&apos;est au tour du :{" "}
              </h2>
              <RoleCard
                name={role.name}
                description={""}
                backgroundColors={getColorGradient(role.color)}
              />
            </div>
          )}
          {/* Joueur principal */}
          <div className="flex flex-col items-center bg-[#00000033] rounded-lg p-4 w-5/6">
            <p className="text-white font-bold mb-2">Votre ville : </p>
            <div className="flex flex-wrap  space-x-2 overflow-x-auto">
              {buildingCard.map((card, cardIdx) => (
                <GameCard
                  key={cardIdx}
                  id={cardIdx}
                  name={card.name}
                  description={card.description}
                  price={card.cost.toString()}
                  backgroundColors={getColorGradient(card.color)}
                  isPlayed={true}
                  type={getBuildingRole(card.color)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col items-center space-y-4 w-1/4">
          {[2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="flex flex-col items-center bg-[#00000033] rounded-lg p-2 w-full"
            >
              <p className="text-white font-bold mb-1">Joueur {idx + 3}</p>
              <div className="flex flex-wrap gap-4 space-x-2 overflow-x-auto">
                {buildingCard.map((card, cardIdx) => (
                  <GameCard
                    key={cardIdx}
                    id={cardIdx}
                    name={card.name}
                    description={card.description}
                    price={card.cost.toString()}
                    backgroundColors={getColorGradient(card.color)}
                    isPlayed={true}
                    type={getBuildingRole(card.color)}
                  />
                ))}
              </div>
              <div className="flex space-x-2 mt-2">
                <div className="flex items-center space-x-1">
                  <p className="text-white">9</p>
                  <Image
                    src="/game/flash-cards.png"
                    alt="cartes"
                    width={24}
                    height={20}
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <p className="text-white">9</p>
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
          {role && (
            <RoleCard
              name={role.name}
              description={role.description}
              backgroundColors={getColorGradient(role.color)}
            />
          )}
        </div>

        <div className="flex w-2/3 justify-center space-x-[-32px] relative">
          <div className="flex w-2/3 justify-center space-x-[-32px] relative">
            {deckCards.length > 0 ? (
              deckCards.map((eachData, index) => (
                <GameCard
                  key={index}
                  id={index}
                  name={eachData.name}
                  description={eachData.description}
                  price={eachData.cost.toString()}
                  backgroundColors={getColorGradient(eachData.color)}
                  isPlayed={false}
                  type={getBuildingRole(eachData.color)}
                />
              ))
            ) : (
              <p className="text-white">Chargement des cartes...</p>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-row items-center justify-between ml-12">
            <p className="h-fit text-xl text-white">9</p>
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
            <p className="h-fit text-xl text-white">9</p>
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
      </div>
    </main>
  );
}
