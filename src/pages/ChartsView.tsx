
import { useAttacksData } from '../api/useAttacksData';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip } from 'recharts';

export default function ChartsView() {
  const data = useAttacksData();

  const summary = Object.values(
    data.reduce((acc: any, d) => {
      acc[d.AttackType] = acc[d.AttackType] || { name: d.AttackType, count: 0 };
      acc[d.AttackType].count++;
      return acc;
    }, {})
  );

  return (
    <BarChart width={600} height={300} data={summary}>
      <XAxis dataKey="name" />
      <YAxis />
      <RTooltip />
      <Bar dataKey="count" />
    </BarChart>
  );
}
