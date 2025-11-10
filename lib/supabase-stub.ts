/**
 * Temporary stub for Supabase during migration to Firebase
 * This prevents build errors while components are being migrated
 */

const throwMigrationError = () => {
  throw new Error('This feature is being migrated to Firebase. Please check back soon.');
};

export const supabase = new Proxy({} as any, {
  get() {
    return throwMigrationError;
  }
});
