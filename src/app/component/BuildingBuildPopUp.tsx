import React from "react";
import GameCard from "./GameCard";

export default function BuildPopup({ isOpen, onClose, gameState, socket, handlePlayCard,handleDiscard, getColorGradient, getBuildingRole }: {
  readonly isOpen: any,
  readonly onClose: any,
  readonly gameState: any,
  readonly socket: any,
  readonly handleDiscard: any,
  readonly handlePlayCard: any,
  readonly getColorGradient: any,
  readonly getBuildingRole: any,
}) {

  if (!isOpen) return null; // ← popup invisible si fermée

  const player = gameState?.players?.find((p: any) => p.id === socket.id);

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto text-black dark:text-white">

        {/* TITRE */}
        <h2 className="text-2xl font-bold mb-4 text-center">
          Construisez un bâtiment
        </h2>

        {/* LISTE DES CARTES */}
        <div className="flex flex-wrap justify-center gap-4">
          {player?.hand ? (
            player.hand.map((card: any, idx: number) => (
              <GameCard
                key={idx}
                id={idx}
                name={card.name}
                description={card.description}
                price={card.cost.toString()}
                backgroundColors={getColorGradient(card.color)}
                isPlayed={false}
                type={getBuildingRole(card.color)}
                isPlayable={gameState.currentPlayerId === socket.id}
                canBeBuilded={card.cost <= player.gold}
                handleDiscard={() => {
                  handleDiscard(card);
                  onClose(); // 🟢 ferme la popup après construction
                }}
                handleBuildCard={() => {
                  handlePlayCard(card);
                  onClose(); // 🟢 ferme la popup après construction
                }}
              />
            ))
          ) : (
            <p className="text-center text-gray-600 dark:text-slate-300">Chargement des cartes...</p>
          )}
        </div>

        {/* BOUTON FERMER */}
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg hover:bg-gray-400 text-black dark:text-white"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
