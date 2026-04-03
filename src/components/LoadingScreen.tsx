export function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="loading-screen">
      <div className="loading-animation">
        <span className="fish-icon">🐟</span>
        <div className="loading-waves">
          <span></span><span></span><span></span>
        </div>
      </div>
      <p>{message}</p>
    </div>
  );
}
