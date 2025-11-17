export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <div className="animate-pulse absolute inset-0 rounded-full h-16 w-16 border-4 border-primary/20 mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold mb-2">Loading Employee Portal</h2>
        <p className="text-sm text-muted-foreground">Please wait while we prepare your dashboard...</p>
      </div>
    </div>
  );
}
