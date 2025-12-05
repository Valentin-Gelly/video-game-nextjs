// socket.ts
import { io } from "socket.io-client";

// ⚙️ Déterminer l'URL du serveur Socket.io selon l'environnement
export const getSocketUrl = () => {
  if (typeof window === "undefined") {
    // Côté serveur
    return "http://localhost:3000";
  }

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const host = window.location.host; // valentingelly.cloud en production, localhost:3000 en dev

  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return "http://localhost:3000";
  }

  return `${protocol}//${host}`;
};

export const socket = io(getSocketUrl(), {
  autoConnect: true,
  transports: ["websocket", "polling"], // Ajouter polling pour plus de compatibilité
});

socket.on("connect", () => {
  console.log("✅ Connecté au serveur Socket.IO :", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Déconnecté du serveur Socket.IO");
});
