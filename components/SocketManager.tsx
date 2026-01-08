import { useEffect } from "react";
import socketService from "../services/socketService";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateBookingStatus } from "../store/slices/bookingSlice";
import { User } from "../types/user";

const SocketManager = () => {
  const user = useAppSelector((state) => state.user.user as User | null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user?._id) {
      socketService.connect(user._id);

      socketService.on(
        "payment_success",
        (data: {
          bookingId: string;
          status: string;
          transactionId?: string;
        }) => {
          console.log("Payment success event received:", data);

          if (data.status === "CONFIRMED") {
            dispatch(
              updateBookingStatus({
                bookingId: data.bookingId,
                status: "upcoming",
              })
            );
          }
        }
      );

      return () => {
        if (!user?._id) {
          socketService.disconnect();
        }
      };
    } else {
      socketService.disconnect();
    }
  }, [user?._id, dispatch]);

  return null;
};

export default SocketManager;
