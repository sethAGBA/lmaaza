import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {this.props.title || 'Une erreur est survenue'}
          </h2>
          <p className="text-gray-600 mb-4 max-w-md">
            {this.props.message ||
              'Veuillez rafraîchir la page. Vos données sont sauvegardées.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Rafraîchir
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
