import { Server } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";
import { startGameHandler } from "../../../services/game";

// This file should be placed in pages/api/socket.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.IO server...");
    const io = new Server(res.socket.server as any, {
      path: "/api/socket_io",
      // You can configure CORS here
      cors: {
        origin: "*",
      },
    });

    // Basic namespacing: we'll use rooms by gameId
    io.on("connection", (socket) => {
      console.log("socket connected", socket.id);

      socket.on("joinGame", (gameId: string) => {
        console.log(`socket ${socket.id} joins game ${gameId}`);
        socket.join(gameId);
      });

      socket.on(
        "startGame",
        async (payload: { gameId: string; playerIds: number[] }) => {
          try {
            const result = await startGameHandler(
              io,
              payload.gameId,
              payload.playerIds
            );
            // startGameHandler will emit inside, but respond here as well
            socket
              .to(payload.gameId)
              .emit("notification", { message: "Game starting" });
          } catch (err) {
            console.error("startGame error", err);
            socket.emit("error", { message: String(err) });
          }
        }
      );

      socket.on("disconnect", () => {
        console.log("socket disconnected", socket.id);
      });
    });

    // attach to next res
    (res.socket.server as any).io = io;
    console.log("Socket.IO server initialized");
  } else {
    console.log("Socket.IO server already running");
  }

  res.end();
}
