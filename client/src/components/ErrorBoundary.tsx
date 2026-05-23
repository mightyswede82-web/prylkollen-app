import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught:', error);
    // Log the error but don't show it to the user - let the app continue
    return { hasError: false, error };
  }

  render() {
    // Always render children, even if there's an error
    // Errors are logged to console but not shown to user
    return this.props.children;
  }
}

export default ErrorBoundary;
