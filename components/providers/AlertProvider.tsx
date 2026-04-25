import React, { createContext, useContext, useState, ReactNode } from "react";
import { AlertModal, AlertButton } from "../ui/AlertModal";

interface AlertOptions {
  title: string;
  message: string;
  buttons?: AlertButton[];
  type?: "info" | "success" | "error" | "warning";
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions>({
    title: "",
    message: "",
  });

  const showAlert = (newOptions: AlertOptions) => {
    setOptions(newOptions);
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AlertModal
        visible={visible}
        title={options.title}
        message={options.message}
        buttons={options.buttons || [{ text: "OK", onPress: hideAlert }]}
        type={options.type}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};
