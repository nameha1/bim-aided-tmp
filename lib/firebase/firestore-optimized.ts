import { getDocuments } from './firestore';
import { QueryConstraint } from 'firebase/firestore';

// Cache for storing query results
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Pending requests to prevent duplicate simultaneous queries
const pendingQueries = new Map<string, Promise<any>>();

/**
 * Generate a cache key from collection name and constraints
 */
function generateCacheKey(collection: string, constraints?: QueryConstraint[]): string {
  const constraintString = constraints 
    ? JSON.stringify(constraints.map(c => c.type))
    : 'none';
  return `${collection}:${constraintString}`;
}

/**
 * Optimized getDocuments with caching and deduplication
 */
export async function getDocumentsOptimized(
  collection: string,
  constraints?: QueryConstraint[],
  options?: {
    useCache?: boolean;
    cacheDuration?: number;
  }
) {
  const { useCache = true, cacheDuration = CACHE_DURATION } = options || {};
  const cacheKey = generateCacheKey(collection, constraints);

  // Check cache first
  if (useCache) {
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return { data: cached.data, error: null, fromCache: true };
    }
  }

  // Check if there's already a pending query for this
  if (pendingQueries.has(cacheKey)) {
    return pendingQueries.get(cacheKey)!;
  }

  // Create new query
  const queryPromise = getDocuments(collection, constraints)
    .then(result => {
      // Cache successful results
      if (result.data && !result.error && useCache) {
        queryCache.set(cacheKey, {
          data: result.data,
          timestamp: Date.now(),
        });
      }
      
      // Remove from pending
      pendingQueries.delete(cacheKey);
      
      return { ...result, fromCache: false };
    })
    .catch(error => {
      // Remove from pending on error
      pendingQueries.delete(cacheKey);
      throw error;
    });

  // Store as pending
  pendingQueries.set(cacheKey, queryPromise);

  return queryPromise;
}

/**
 * Batch multiple queries together
 */
export async function batchQueries<T extends Record<string, any>>(
  queries: Array<{
    key: keyof T;
    collection: string;
    constraints?: QueryConstraint[];
    useCache?: boolean;
  }>
): Promise<T> {
  const results = await Promise.all(
    queries.map(async ({ key, collection, constraints, useCache }) => {
      const result = await getDocumentsOptimized(collection, constraints, { useCache });
      return { key, data: result.data, error: result.error };
    })
  );

  return results.reduce((acc, { key, data }) => {
    acc[key] = data;
    return acc;
  }, {} as T);
}

/**
 * Clear cache for specific collection or all
 */
export function clearCache(collection?: string) {
  if (collection) {
    // Clear only entries for specific collection
    const keysToDelete: string[] = [];
    queryCache.forEach((_, key) => {
      if (key.startsWith(`${collection}:`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => queryCache.delete(key));
  } else {
    // Clear all cache
    queryCache.clear();
  }
}

/**
 * Prefetch data for better perceived performance
 */
export async function prefetchDocuments(
  collection: string,
  constraints?: QueryConstraint[]
) {
  return getDocumentsOptimized(collection, constraints, { useCache: true });
}
