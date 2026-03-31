import { Prior } from './types';
import { DistributionSelect } from './DistributionSelect';

interface PriorInputProps {
  value: Prior;
  onChange: (value: Prior) => void;
}

export function PriorInput({ value, onChange }: PriorInputProps) {
  return (
    <div className="flex gap-1.5 items-center">
      <DistributionSelect
        value={value.dist}
        onChange={(dist) => onChange({ ...value, dist })}
      />
      <input
        type="text"
        value={value.params}
        onChange={(e) => onChange({ ...value, params: e.target.value })}
        className="flex-1 px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
      />
    </div>
  );
}
