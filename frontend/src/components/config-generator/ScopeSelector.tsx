import { ScopeType } from './types';
import { useState } from 'react';

interface ScopeSelectorProps {
  value: ScopeType;
  onChange: (value: ScopeType) => void;
}

export function ScopeSelector({ value, onChange }: ScopeSelectorProps) {
  const [name] = useState(() => `scope-${Math.random().toString(36).substring(7)}`);
  
  return (
    <div className="flex gap-2 items-center mb-1.5">
      <label className="flex items-center gap-1.5 m-0 font-normal text-sm cursor-pointer">
        <input
          type="radio"
          name={name}
          value="global"
          checked={value === 'global'}
          onChange={(e) => onChange(e.target.value as ScopeType)}
          className="w-auto mr-0.5"
        />
        Global
      </label>
      <label className="flex items-center gap-1.5 m-0 font-normal text-sm cursor-pointer">
        <input
          type="radio"
          name={name}
          value="per_instrument"
          checked={value === 'per_instrument'}
          onChange={(e) => onChange(e.target.value as ScopeType)}
          className="w-auto mr-0.5"
        />
        Per-instrument
      </label>
      <label className="flex items-center gap-1.5 m-0 font-normal text-sm cursor-pointer">
        <input
          type="radio"
          name={name}
          value="per_visit"
          checked={value === 'per_visit'}
          onChange={(e) => onChange(e.target.value as ScopeType)}
          className="w-auto mr-0.5"
        />
        Per-visit
      </label>
    </div>
  );
}