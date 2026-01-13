import { useEffect, useState } from 'react';
import { AttackEvent } from '../types/attack';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useAttacksData() {
  const [data, setData] = useState<AttackEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/attacks`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          // Filter out entries without country
          const filteredData = result.data.filter((d: AttackEvent) => d.Country);
          setData(filteredData);
        } else {
          throw new Error(result.message || 'Failed to fetch attack data');
        }
        
      } catch (err) {
        console.error('Error fetching attacks data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch attack data');
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return { data, loading, error, refetch: () => fetchData() };

  function fetchData() {
    // Internal refetch function
    const internalFetch = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/attacks?refresh=true`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          const filteredData = result.data.filter((d: AttackEvent) => d.Country);
          setData(filteredData);
        } else {
          throw new Error(result.message || 'Failed to fetch attack data');
        }
        
      } catch (err) {
        console.error('Error fetching attacks data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch attack data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    
    internalFetch();
  }
}