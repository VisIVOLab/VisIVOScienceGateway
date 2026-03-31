import { GP, KernelType, KERNELS } from './types';
import { PriorInput } from './PriorInput';

interface GPEditorProps {
  gp: GP;
  onChange: (gp: GP) => void;
  onRemove: () => void;
}

export function GPEditor({ gp, onChange, onRemove }: GPEditorProps) {
  const handleKernelChange = (kernel: KernelType) => {
    const params = KERNELS[kernel] || [];
    const hyperparams: Record<string, { dist: any; params: string }> = {};
    params.forEach(p => {
      hyperparams[p.n] = { dist: p.d, params: p.p };
    });
    onChange({ ...gp, kernel, hyperparams });
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
          value={gp.name}
          onChange={(e) => onChange({ ...gp, name: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">
          instruments (comma-separated) <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white align-middle ml-1.5 bg-[#d73a49]">Required</span>
        </label>
        <input
          type="text"
          value={gp.instruments}
          onChange={(e) => onChange({ ...gp, instruments: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Which instruments this GP applies to. Must match the global instruments list.
        </div>
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">kernel</label>
        <select
          value={gp.kernel}
          onChange={(e) => handleKernelChange(e.target.value as KernelType)}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        >
          {Object.keys(KERNELS).map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Kernel type. O(N): Matern32/52 quasisep, SHO, Constant. O(N³): ExpSquared, QuasiPeriodic, ExpSineSquared.
        </div>
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">x_variable</label>
        <input
          type="text"
          value={gp.xVariable}
          onChange={(e) => onChange({ ...gp, xVariable: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Input variable for the GP (e.g. BJD, ROLL_ANGLE).
        </div>
      </div>

      <div className="mb-3.5 flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={gp.perVisit}
          onChange={(e) => onChange({ ...gp, perVisit: e.target.checked })}
          className="w-auto"
        />
        <label className="m-0 font-normal">per_visit (block-diagonal, shared hyperparams)</label>
        <div className="text-xs text-[#586069] ml-5 leading-tight">
          Splits the GP covariance per visit while sharing kernel parameters.
        </div>
      </div>

      {Object.entries(gp.hyperparams).map(([name, prior]) => {
        const param = KERNELS[gp.kernel]?.find(p => p.n === name);
        return (
          <div key={name} className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">
              {name} <span className="font-normal text-[#586069] text-xs">{param?.h}</span>
            </label>
            <PriorInput
              value={prior}
              onChange={(newPrior) => {
                onChange({
                  ...gp,
                  hyperparams: { ...gp.hyperparams, [name]: newPrior }
                });
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
