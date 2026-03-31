import { DISTRIBUTIONS, DistType } from './types';

interface DistributionSelectProps {
  value: DistType;
  onChange: (value: DistType) => void;
}

export function DistributionSelect({ value, onChange }: DistributionSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DistType)}
      className="w-[38%] px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
    >
      {DISTRIBUTIONS.map(dist => (
        <option key={dist.v} value={dist.v}>
          {dist.l}
        </option>
      ))}
    </select>
  );
}
