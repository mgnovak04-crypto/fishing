import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  message: string;
  onSkip?: () => void;
  skipLabel?: string;
  skipAfterMs?: number;
}

export function LoadingScreen({ message, onSkip, skipLabel = 'Use Oslo instead', skipAfterMs = 3000 }: LoadingScreenProps) {
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    if (!onSkip) return;
    const t = setTimeout(() => setShowSkip(true), skipAfterMs);
    return () => clearTimeout(t);
  }, [onSkip, skipAfterMs]);

  return (
    <div className="loading-screen">
      <div className="loading-animation">
        <span className="fish-icon">🐟</span>
        <div className="loading-waves">
          <span></span><span></span><span></span>
        </div>
      </div>
      <p>{message}</p>
      {showSkip && onSkip && (
        <button className="skip-btn" onClick={onSkip}>{skipLabel}</button>
      )}
    </div>
  );
}
