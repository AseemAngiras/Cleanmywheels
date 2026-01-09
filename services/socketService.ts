import { Platform } from "react-native";
import { io, Socket } from "socket.io-client";
import { MY_PC_IP } from "../store/api/authApi";

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    if (this.userId === userId && this.socket?.connected) {
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.userId = userId;

    console.log("Connecting socket for user:", userId);

    const socketUrl = `http://${MY_PC_IP}:5000/base`;
    console.log("Connecting to socket URL:", socketUrl);

    this.socket = io(socketUrl, {
      query: { userId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      extraHeaders: {
        "x-platform": Platform.OS === "ios" ? "ios" : "android",
      },
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("connect_error", (err) => {
      console.log("Socket connection error:", err);
    });
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      return;
    }
    this.socket.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }
}

export default new SocketService();
