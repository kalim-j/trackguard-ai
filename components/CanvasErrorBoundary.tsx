'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class CanvasErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true,
      errorMessage: error.message || 'WebGL Context Lost'
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("3D Render Exception caught by Boundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="w-full h-full min-h-[350px] bg-navy-900 border border-red-500/20 rounded-2xl flex flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-500 animate-pulse" />
          <h3 className="text-sm font-bold text-gray-200 font-mono">3D DIGITAL TWIN CRASHED</h3>
          <p className="text-xs text-gray-400 max-w-[280px] leading-relaxed">
            Your browser lost the WebGL rendering context (GPU memory exhaustion or tab suspend). Try switching to the 2D Map option.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
