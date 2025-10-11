// socket.ts
import { io } from "socket.io-client";

// ⚙️ URL de ton serveur Node/Express + Socket.io
// En dev : http://localhost:3000 (même que ton Next.js)
export const socket = io("http://localhost:3000", {
  autoConnect: true,
  transports: ["websocket"], // plus rapide et plus fiable
});

socket.on("connect", () => {
  console.log("✅ Connecté au serveur Socket.IO :", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Déconnecté du serveur Socket.IO");
});
