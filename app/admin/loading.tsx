export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto mb-4"></div>
          <div className="animate-pulse absolute inset-0 rounded-full h-16 w-16 border-4 border-cyan-500/20 mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold mb-2">Loading Admin Dashboard</h2>
        <p className="text-sm text-muted-foreground">Preparing your administrative tools...</p>
      </div>
    </div>
  );
}
