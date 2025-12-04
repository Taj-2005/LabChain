import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/stores/useAuth";

const SOCKET_HOST =
  process.env.NEXT_PUBLIC_SOCKET_HOST || "http://localhost:3001";

export function useSocket() {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [presence, setPresence] = useState<string[]>([]);

  useEffect(() => {
    if (!token) {
      return;
    }

    // Initialize socket connection
    const socket = io(SOCKET_HOST, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socket.on(
      "presence-update",
      (data: { experimentId: string; userIds: string[] }) => {
        setPresence(data.userIds);
      }
    );

    socket.on(
      "user-joined",
      (data: { userId: string; experimentId: string }) => {
        console.log("User joined:", data.userId);
        // Update presence list
        setPresence((prev) => {
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId];
          }
          return prev;
        });
      }
    );

    socket.on("user-left", (data: { userId: string; experimentId: string }) => {
      console.log("User left:", data.userId);
      setPresence((prev) => prev.filter((id) => id !== data.userId));
    });

    socket.on(
      "experiment-updated",
      (data: { experimentId: string; delta: unknown; updatedBy: string }) => {
        console.log("Experiment updated:", data);
        // Could trigger a refetch here
      }
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const joinExperiment = (experimentId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("join-experiment", { experimentId });
    }
  };

  const leaveExperiment = (experimentId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("leave-experiment", { experimentId });
    }
  };

  return {
    isConnected,
    presence,
    joinExperiment,
    leaveExperiment,
  };
}
