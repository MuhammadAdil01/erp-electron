import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  /** Shown in the fallback so the user knows which screen failed. */
  label?: string;
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Stops one screen's render error from taking the application with it.
 *
 * React unmounts the entire root when an error escapes render, so before this
 * existed a single bad field access inside one ERP window blanked the whole app
 * to white — which is exactly how the Company Administration screen presented.
 * A boundary per window turns that into a message in the window that failed,
 * with the rest of the session still logged in and usable.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keep the stack in the devtools console; the fallback below stays terse.
    console.error(`[${this.props.label ?? 'screen'}] render failed`, error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-white p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-orange-500 mb-2" />
        <div className="text-[12px] font-bold text-[#333] mb-1">
          {this.props.label ?? 'This screen'} could not be displayed
        </div>
        <div className="text-[10.5px] text-gray-600 max-w-md break-words mb-3">{error.message}</div>
        <button
          onClick={this.reset}
          className="px-3 py-1 text-[10.5px] border border-gray-500 bg-gradient-to-b from-[#fff6d5] to-[#ffec99] rounded-[1px] hover:brightness-95"
        >
          Try again
        </button>
        <div className="text-[9.5px] text-gray-400 mt-3">
          You are still signed in — close this window and continue working.
        </div>
      </div>
    );
  }
}
