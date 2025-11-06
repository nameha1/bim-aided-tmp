import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SqlExecutor() {
  const [sql, setSql] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const executeSql = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (!statement) continue;
        
        try {
          const { error } = await supabase.rpc('exec', {
            sql: statement + ';'
          });
          
          if (error) {
            setResults(prev => [...prev, `❌ Error: ${error.message}`]);
          } else {
            setResults(prev => [...prev, `✅ Success: ${statement.substring(0, 50)}...`]);
          }
        } catch (err: any) {
          setResults(prev => [...prev, `❌ Exception: ${err.message}`]);
        }
      }
      
      setResults(prev => [...prev, '\n✅ All statements processed!']);
    } catch (error: any) {
      setResults(prev => [...prev, `❌ Fatal error: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">SQL Executor</h1>
        <Alert className="mb-4">
          <AlertDescription>
            Paste your SQL here and click Execute. This bypasses the broken Studio API.
          </AlertDescription>
        </Alert>
        
        <Textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          placeholder="Paste your SQL here..."
          className="min-h-[300px] font-mono text-sm mb-4"
        />
        
        <Button onClick={executeSql} disabled={loading || !sql}>
          {loading ? 'Executing...' : 'Execute SQL'}
        </Button>
        
        {results.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded font-mono text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">
            {results.map((result, i) => (
              <div key={i}>{result}</div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
