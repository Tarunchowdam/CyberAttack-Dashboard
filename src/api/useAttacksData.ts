import { useEffect, useState } from 'react';
import axios from 'axios';
import { AttackEvent } from '../types/attack';

export function useAttacksData() {
  const [data, setData] = useState<AttackEvent[]>([]);

  useEffect(() => {
    async function fetchData() {
      const res = await axios.get<AttackEvent[]>("http://localhost:5000/api/attacks");
      setData(res.data.filter(d => d.Country));
    }
    fetchData();
  }, []);

  return data;
}
