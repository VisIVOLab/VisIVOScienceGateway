import { Polynomial, ScopeType, DistType } from './types';
import { PriorInput } from './PriorInput';

interface PolynomialEditorProps {
  polynomial: Polynomial;
  onChange: (poly: Polynomial) => void;
  onRemove: () => void;
}

export function PolynomialEditor({ polynomial, onChange, onRemove }: PolynomialEditorProps) {
  const addDegree = () => {
    const newDegree = polynomial.degrees.length + 2;
    if (newDegree > 8) {
      alert('Max degree 8 reached');
      return;
    }
    onChange({
      ...polynomial,
      degrees: [...polynomial.degrees, {
        degree: newDegree,
        prior: { dist: 'uniform', params: '-1e-6, 1e-6' }
      }]
    });
  };

  const removeDegree = (index: number) => {
    onChange({
      ...polynomial,
      degrees: polynomial.degrees.filter((_, i) => i !== index)
    });
  };

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
          value={polynomial.name}
          onChange={(e) => onChange({ ...polynomial, name: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">x_variable</label>
        <input
          type="text"
          value={polynomial.xVariable}
          onChange={(e) => onChange({ ...polynomial, xVariable: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Column name from data file (e.g. BJD, CENTROID_X, BACKGROUND).
        </div>
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">scope</label>
        <select
          value={polynomial.scope}
          onChange={(e) => onChange({ ...polynomial, scope: e.target.value as ScopeType })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        >
          <option value="per_visit">per_visit</option>
          <option value="per_instrument">per_instrument</option>
          <option value="global">global</option>
        </select>
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Coefficients are expanded per-visit, per-instrument, or globally.
        </div>
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">c1 (linear) — prior</label>
        <PriorInput
          value={polynomial.c1}
          onChange={(c1) => onChange({ ...polynomial, c1 })}
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Linear coefficient. c0 not allowed (use normalization).
        </div>
      </div>

      {polynomial.degrees.map((deg, index) => (
        <div key={deg.degree} className="mb-3.5">
          <label className="block font-semibold mb-0.5 text-sm">
            c{deg.degree} (degree {deg.degree}) — prior
          </label>
          <PriorInput
            value={deg.prior}
            onChange={(prior) => {
              const newDegrees = [...polynomial.degrees];
              newDegrees[index] = { ...deg, prior };
              onChange({ ...polynomial, degrees: newDegrees });
            }}
          />
          <button
            onClick={() => removeDegree(index)}
            className="mt-0.5 bg-[#d73a49] text-white border-none rounded-md px-2 py-0.5 cursor-pointer text-xs"
          >
            Remove c{deg.degree}
          </button>
        </div>
      ))}

      <button
        onClick={addDegree}
        className="bg-[#2ea44f] text-white border-none rounded-md px-3 py-1.5 cursor-pointer text-sm mb-2.5"
      >
        + Add degree
      </button>
    </div>
  );
}
