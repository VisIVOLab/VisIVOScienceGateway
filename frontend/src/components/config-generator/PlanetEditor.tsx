import { Planet } from './types';
import { PriorInput } from './PriorInput';
import { Badge } from './Badge';

interface PlanetEditorProps {
  planet: Planet;
  onChange: (planet: Planet) => void;
  onRemove: () => void;
}

export function PlanetEditor({ planet, onChange, onRemove }: PlanetEditorProps) {
  return (
    <div className="border border-[#d1d5da] rounded-md p-4 mb-3.5 bg-[#fafbfc] relative">
      <button
        onClick={onRemove}
        className="absolute top-1.5 right-2 bg-[#d73a49] text-white border-none rounded-md px-2 py-0.5 cursor-pointer text-xs"
      >
        ✕
      </button>

      <h3 className="mt-4 mb-1.5 text-base text-[#444]">planet_{planet.suffix}</h3>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">Ephemeris mode</label>
        <select
          value={planet.ephemerisMode}
          onChange={(e) => onChange({ ...planet, ephemerisMode: e.target.value as 'ref' | 'direct' })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        >
          <option value="ref">tau_ref + delta_tau (float64 precision)</option>
          <option value="direct">tau (direct)</option>
        </select>
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          ref+delta recommended for well-known ephemerides (preserves float64 precision).
        </div>
      </div>

      {planet.ephemerisMode === 'ref' ? (
        <>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">tau_ref</label>
            <input
              type="number"
              step="any"
              value={planet.tauRef}
              onChange={(e) => onChange({ ...planet, tauRef: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Fixed reference mid-transit time (BJD). High-precision anchor.
            </div>
          </div>

          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">delta_tau — prior</label>
            <PriorInput
              value={planet.deltaTau}
              onChange={(deltaTau) => onChange({ ...planet, deltaTau })}
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Small offset from tau_ref. Use 0 for fixed.
            </div>
          </div>

          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">period_ref</label>
            <input
              type="number"
              step="any"
              value={planet.periodRef}
              onChange={(e) => onChange({ ...planet, periodRef: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Fixed reference orbital period (days).
            </div>
          </div>

          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">delta_period — prior</label>
            <PriorInput
              value={planet.deltaPeriod}
              onChange={(deltaPeriod) => onChange({ ...planet, deltaPeriod })}
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Small offset from period_ref. Use 0 for fixed.
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">tau — prior</label>
            <PriorInput
              value={planet.tau}
              onChange={(tau) => onChange({ ...planet, tau })}
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Direct mid-transit time prior. Cannot coexist with tau_ref.
            </div>
          </div>

          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">period — prior</label>
            <PriorInput
              value={planet.period}
              onChange={(period) => onChange({ ...planet, period })}
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Direct orbital period prior. Cannot coexist with period_ref.
            </div>
          </div>
        </>
      )}

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">
          impact — prior <Badge variant="required">Required</Badge>
        </label>
        <PriorInput
          value={planet.impact}
          onChange={(impact) => onChange({ ...planet, impact })}
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Impact parameter b (global only). 0 = central transit.
        </div>
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">
          rp_by_rs — prior <Badge variant="required">Required</Badge>
        </label>
        <PriorInput
          value={planet.rpByRs}
          onChange={(rpByRs) => onChange({ ...planet, rpByRs })}
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Planet-to-star radius ratio Rp/R★ (global or per_instrument).
        </div>
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">ecos</label>
        <input
          type="text"
          value={planet.ecos}
          onChange={(e) => onChange({ ...planet, ecos: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          e·cos(ω). 0 for circular orbit (default). Can be fixed or sampled.
        </div>
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">esin</label>
        <input
          type="text"
          value={planet.esin}
          onChange={(e) => onChange({ ...planet, esin: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          e·sin(ω). 0 for circular orbit (default).
        </div>
      </div>

      <h3 className="mt-4 mb-1.5 text-base text-[#444]">Phase Curve & RV</h3>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">amp_night</label>
        <input
          type="text"
          value={planet.ampNight}
          onChange={(e) => onChange({ ...planet, ampNight: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Nightside flux [ppm]. Default 0 (optional, global or per_instrument).
        </div>
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">amp_day_minus_amp_night</label>
        <input
          type="text"
          value={planet.ampDayMinusAmpNight}
          onChange={(e) => onChange({ ...planet, ampDayMinusAmpNight: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Dayside − nightside flux [ppm]. Use [global, uniform, 0, 150] for sampled.
        </div>
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">amp_beam</label>
        <input
          type="text"
          value={planet.ampBeam}
          onChange={(e) => onChange({ ...planet, ampBeam: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Doppler beaming amplitude [ppm] (default 0).
        </div>
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">amp_ellip</label>
        <input
          type="text"
          value={planet.ampEllip}
          onChange={(e) => onChange({ ...planet, ampEllip: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Ellipsoidal variation amplitude [ppm] (default 0).
        </div>
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">phoffset</label>
        <input
          type="text"
          value={planet.phoffset}
          onChange={(e) => onChange({ ...planet, phoffset: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Phase curve offset [radians] (default 0).
        </div>
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">tidallag</label>
        <input
          type="text"
          value={planet.tidallag}
          onChange={(e) => onChange({ ...planet, tidallag: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          Tidal lag angle [radians] (default 0).
        </div>
      </div>

      <div className="mb-3.5">
        <label className="block font-semibold mb-0.5 text-sm">kRV</label>
        <input
          type="text"
          value={planet.kRV}
          onChange={(e) => onChange({ ...planet, kRV: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
        />
        <div className="text-xs text-[#586069] mt-0.5 leading-tight">
          RV semi-amplitude [m/s]. Default 1.0 placeholder. Set a proper prior for RV fits (e.g. [global, uniform, 0, 500]).
        </div>
      </div>
    </div>
  );
}
