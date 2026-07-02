import React, { ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Colors } from "./constants/Colors";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-background px-5">
          <Text className="mb-2.5 text-2xl font-bold text-primary">Oops!</Text>

          <Text className="mb-5 text-center text-base text-text">
            Something went wrong. We&apos;re sorry for the inconvenience.
          </Text>

          <TouchableOpacity
            onPress={this.resetError}
            className="rounded-lg bg-primary px-5 py-2.5"
          >
            <Text className="font-bold text-black">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
