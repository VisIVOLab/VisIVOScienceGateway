import { Fourier, ScopeType } from './types';
import { PriorInput } from './PriorInput';

interface FourierEditorProps {
  fourier: Fourier;
  onChange: (fourier: Fourier) => void;
  onRemove: () => void;
}

export function FourierEditor({ fourier, onChange, onRemove }: FourierEditorProps) {
  return (
    <div className="border border-[#d1d5da] rounded-md p-4 mb-3.5 bg-[#fafbfc] relative">
      <button
        onClick={onRemove}
        className="absolute top-1.5 right-2 bg-[#d73a49] text-white border-none rounded-md px-2 py-0.5 cursor-pointer text-xs"
      >
        ✕
      </button>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">Name</label>
        <input
          type="text"
          value={fourier.name}
          onChange={(e) => onChange({ ...fourier, name: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">x_variable</label>
        <input
          type="text"
          value={fourier.xVariable}
          onChange={(e) => onChange({ ...fourier, xVariable: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Column name from data file.
        </div>
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">period</label>
        <input
          type="text"
          value={fourier.period}
          onChange={(e) => onChange({ ...fourier, period: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Reference period in same units as x_variable. Supports math expressions.
        </div>
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">scope</label>
        <select
          value={fourier.scope}
          onChange={(e) => onChange({ ...fourier, scope: e.target.value as ScopeType })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        >
          <option value="per_visit">per_visit</option>
          <option value="per_instrument">per_instrument</option>
          <option value="global">global</option>
        </select>
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">c1 (1st harmonic) — prior</label>
        <PriorInput
          value={fourier.c1}
          onChange={(c1) => onChange({ ...fourier, c1 })}
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Each harmonic produces sin + cos parameter pair.
        </div>
      </div>
    </div>
  );
}
