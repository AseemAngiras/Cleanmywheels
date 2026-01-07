import { io, Socket } from "socket.io-client";

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

    // Adjust URL if needed (e.g. from env or hardcoded)
    // The user previously confirmed backend is on port 5000 for the tunnel, locally it seems to be running on 5000 too based on that.
    // But usually local dev is direct. Assuming localhost:5000 based on previous context or 7000?
    // The user said "backend is on 5000".
    this.socket = io("http://localhost:5000/base", {
      query: { userId },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
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
