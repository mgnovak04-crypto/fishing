interface OfflineBannerProps {
  cacheAge: string | null;
}

export function OfflineBanner({ cacheAge }: OfflineBannerProps) {
  return (
    <div className="offline-banner">
      <span className="offline-dot" />
      <div>
        <strong>Offline Mode</strong>
        <p>
          {cacheAge
            ? `Showing cached data from ${cacheAge}. Connect to update.`
            : 'Using saved data. Weather will update when you have service.'}
        </p>
      </div>
    </div>
  );
}
