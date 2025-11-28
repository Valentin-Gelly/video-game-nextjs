import React from "react";
import GameCard from "./GameCard";

export default function BuildPopup({ isOpen, onClose, gameState, socket, handlePlayCard, getColorGradient, getBuildingRole }) {

  if (!isOpen) return null; // ← popup invisible si fermée

  const player = gameState?.players?.find((p) => p.id === socket.id);

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto">

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
                handleBuildCard={() => {
                  handlePlayCard(card);
                  onClose(); // 🟢 ferme la popup après construction
                }}
              />
            ))
          ) : (
            <p className="text-center text-gray-600">Chargement des cartes...</p>
          )}
        </div>

        {/* BOUTON FERMER */}
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
