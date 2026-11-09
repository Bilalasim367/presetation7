"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { error: null };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep the failure on screen instead of letting Next.js replace the deck
    // with a blank error page. No network requests, no console dependency.
    void error;
    void info;
  }

  public override render(): ReactNode {
    if (this.state.error) {
      return (
        <main className="fixed inset-0 flex items-center justify-center overflow-hidden bg-bg px-16">
          <div className="w-full max-w-[1100px] border-l-2 border-over pl-10">
            <p className="type-figure text-over">Unexpected error</p>
            <h1
              className="mt-6 font-display font-medium leading-none text-text"
              style={{ fontSize: "clamp(40px, 4vw, 76px)", letterSpacing: "-0.02em" }}
            >
              The presenter view stopped.
            </h1>
            <p className="mt-6 max-w-[850px] text-text" style={{ fontSize: "clamp(20px, 1.5vw, 28px)", lineHeight: 1.5 }}>
              Reload the page to restore the deck. Your section position and completed sections are
              saved.
            </p>
            <p className="mt-4 max-w-[850px] break-words text-muted" style={{ fontSize: "clamp(16px, 1.1vw, 20px)", lineHeight: 1.5 }}>
              {this.state.error.message}
            </p>
            <button
              type="button"
              className="mt-10 border border-line-strong bg-surface px-8 py-3 text-text transition-colors hover:bg-surface-hi"
              style={{ fontSize: "clamp(20px, 1.4vw, 26px)" }}
              onClick={() => window.location.reload()}
            >
              Reload presentation
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
