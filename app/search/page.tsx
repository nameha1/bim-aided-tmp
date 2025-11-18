"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs, query, where, or } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'Project' | 'Service' | 'Job';
  url: string;
}

const SearchResults = () => {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(q);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q) {
      performSearch(q);
    }
  }, [q]);

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const lowerCaseTerm = term.toLowerCase();
    
    try {
      // Search projects
      const projectsRef = collection(db, 'projects');
      const projectsQuery = query(projectsRef, 
        or(
          where('title_lowercase', '>=', lowerCaseTerm),
          where('title_lowercase', '<=', lowerCaseTerm + '\uf8ff')
        )
      );
      
      // Search services (assuming a 'services' collection)
      const servicesRef = collection(db, 'services');
      const servicesQuery = query(servicesRef,
        or(
          where('name_lowercase', '>=', lowerCaseTerm),
          where('name_lowercase', '<=', lowerCaseTerm + '\uf8ff')
        )
      );

      // Search jobs
      const jobsRef = collection(db, 'job-postings');
      const jobsQuery = query(jobsRef,
        or(
          where('title_lowercase', '>=', lowerCaseTerm),
          where('title_lowercase', '<=', lowerCaseTerm + '\uf8ff')
        )
      );

      const [projectsSnapshot, servicesSnapshot, jobsSnapshot] = await Promise.all([
        getDocs(projectsQuery),
        getDocs(servicesQuery),
        getDocs(jobsQuery),
      ]);

      const searchResults: SearchResult[] = [];

      projectsSnapshot.forEach(doc => {
        const data = doc.data();
        searchResults.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          type: 'Project',
          url: `/projects/${doc.id}`,
        });
      });

      servicesSnapshot.forEach(doc => {
        const data = doc.data();
        searchResults.push({
          id: doc.id,
          title: data.name,
          description: data.short_description,
          type: 'Service',
          url: `/services#${doc.id}`,
        });
      });

      jobsSnapshot.forEach(doc => {
        const data = doc.data();
        searchResults.push({
          id: doc.id,
          title: data.title,
          description: `Location: ${data.location}`,
          type: 'Job',
          url: `/careers/${doc.id}`,
        });
      });

      setResults(searchResults);
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon />
            Website Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-8">
            <Input
              type="search"
              placeholder="Search for projects, services, careers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Search'}
            </Button>
          </form>

          {loading && (
            <div className="text-center">
              <Loader2 className="mx-auto animate-spin text-primary" size={32} />
              <p className="text-muted-foreground mt-2">Searching...</p>
            </div>
          )}

          {!loading && q && results.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p>No results found for &quot;{q}&quot;.</p>
              <p className="text-sm">Try searching for something else.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Found {results.length} result{results.length > 1 ? 's' : ''} for &quot;{q}&quot;
              </h2>
              <ul className="divide-y">
                {results.map(result => (
                  <li key={`${result.type}-${result.id}`} className="py-4">
                    <Link href={result.url} className="group">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                          result.type === 'Project' ? 'bg-blue-100 text-blue-800' :
                          result.type === 'Service' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {result.type}
                        </span>
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {result.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm line-clamp-2">
                        {result.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
            <SearchResults />
        </Suspense>
    )
}
