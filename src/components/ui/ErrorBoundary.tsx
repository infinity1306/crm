import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught CRM Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    sessionStorage.clear();
    window.location.href = '/app';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-crm-bg flex items-center justify-center p-4 text-crm-text">
          <div className="w-full max-w-lg bg-crm-card border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Application Exception Encountered</h2>
              <p className="text-xs text-crm-textMuted mt-1.5 leading-relaxed max-w-md mx-auto">
                An unexpected component error occurred. Your work is saved locally in storage. You can reload the application or return to the overview workspace.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-lg text-left text-xs font-mono text-red-300 max-h-32 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-turquoise text-slate-950 font-bold text-xs rounded-lg hover:bg-turquoise-hover transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-crm-surface border border-crm-border text-crm-text font-semibold text-xs rounded-lg hover:bg-crm-card transition-colors inline-flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5 text-crm-textMuted" />
                <span>Return to Workspace</span>
              </button>
            </div>

            <p className="text-[10px] text-crm-textMuted pt-2">
              Star Chain Labs Enterprise Reliability Engine • Self-Healing Architecture
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
