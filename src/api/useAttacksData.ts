
import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import { AttackEvent } from '../types/attack';

export function useAttacksData() {
  const [data, setData] = useState<AttackEvent[]>([]);

  useEffect(() => {
    Papa.parse('/cyberattacks.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result: any) => {
        const rows = result.data as Record<string, any>[];
        const mapped: AttackEvent[] = rows.map(r => ({
          Country: r['Destination Country'] || r['Source Country'] || r.Country || '',
          AttackType: r['Attack Type'] || r.AttackType || r['AttackType'] || '',
          AffectedSystem: r['Affected System'] || r.AffectedSystem || r['Affected_System'] || '',
          Protocol: r['Protocol'] || r.Protocol || '',
          SourceIP: r['Source IP'] || r.SourceIP || r['Source_IP'] || '',
          detection: r['Detection Label'] || '',
          confidence: r['Confidence Score'] ? parseFloat(r['Confidence Score']) : (r.confidence ? parseFloat(r.confidence) : 0),
        }));
        setData(mapped.filter(d => d.Country));
      },
    });
  }, []);

  return data;
}
