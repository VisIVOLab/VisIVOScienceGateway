import { useState, useEffect } from 'react';
import { ConfigState, Polynomial, Fourier, GP, Planet, KERNELS } from './types';
import { generateYAML } from './utils';
import { Badge } from './Badge';
import { PriorInput } from './PriorInput';
import { ScopeSelector } from './ScopeSelector';
import { PolynomialEditor } from './PolynomialEditor';
import { FourierEditor } from './FourierEditor';
import { GPEditor } from './GPEditor';
import { PlanetEditor } from './PlanetEditor';

export function ConfigGenerator({ fun_run }: { 
  fun_run: (yaml?: any) => void  
}) {
  const [config, setConfig] = useState<ConfigState>({
    workingDir: './',
    filePath: 'my_data.dat',
    instruments: 'CHEOPS',
    dataTypes: 'LC',
    warmupSampler: 'ess',
    numChainsEnsemble: 32,
    numWarmup: 1000,
    chainEnergyThreshold: 10.0,
    numChainsIfNuts: 4,
    internalWarmupIfNuts: 500,
    numSamplesIfNuts: 5000,
    numSamplesIfEnsemble: 5000,
    targetAcceptProb: 0.95,
    maxTreeDepth: 8,
    useFloat64: 'auto',
    checkpointInterval: 500,
    reset: true,
    randomSeed: '',
    denseMass: false,
    discardExtraWarmup: 0,
    traceMaxPoints: '1000',
    normalizationMode: 'multiplicative',
    normalizationScope: 'per_visit',
    normalization: { dist: 'normal', params: '1.0, 0.0001' },
    rollAngleUnfold: false,
    polynomials: [],
    fouriers: [],
    gps: [],
    jitterScope: 'per_visit',
    jitter: { dist: 'uniform', params: '-9.5, -8.5' },
    rhoStar: { dist: 'truncnorm', params: '0.5, 0.8, 0.64, 0.03' },
    q1Scope: 'global',
    q1: { dist: 'uniform', params: '0, 1' },
    q2Scope: 'global',
    q2: { dist: 'uniform', params: '0, 1' },
    planets: [createDefaultPlanet('b')],
  });

  const [yaml, setYaml] = useState('');

  useEffect(() => {
    try {
      setYaml(generateYAML(config));
    } catch (e: any) {
      setYaml('ERROR: ' + e.message);
    }
  }, [config]);

  const addPolynomial = () => {
    const newPoly: Polynomial = {
      id: Math.random().toString(36),
      name: 'poly_time',
      xVariable: 'BJD',
      scope: 'per_visit',
      c1: { dist: 'uniform', params: '-3e-4, 6e-4' },
      degrees: []
    };
    setConfig({ ...config, polynomials: [...config.polynomials, newPoly] });
  };

  const addFourier = () => {
    const newFour: Fourier = {
      id: Math.random().toString(36),
      name: 'fourier_roll',
      xVariable: 'ROLL_ANGLE',
      period: '2*jnp.pi',
      scope: 'per_visit',
      c1: { dist: 'uniform', params: '-0.3, 0.3' }
    };
    setConfig({ ...config, fouriers: [...config.fouriers, newFour] });
  };

  const addGP = () => {
    const kernel = 'Matern32';
    const params = KERNELS[kernel];
    const hyperparams: Record<string, any> = {};
    params.forEach(p => {
      hyperparams[p.n] = { dist: p.d, params: p.p };
    });

    const newGP: GP = {
      id: Math.random().toString(36),
      name: 'GP_roll',
      instruments: 'CHEOPS',
      kernel,
      xVariable: 'ROLL_ANGLE',
      perVisit: false,
      hyperparams
    };
    setConfig({ ...config, gps: [...config.gps, newGP] });
  };

  const addPlanet = () => {
    const existingCount = config.planets.length;
    const suffix = String.fromCharCode(98 + existingCount); // b, c, d, ...
    setConfig({ ...config, planets: [...config.planets, createDefaultPlanet(suffix)] });
  };

  const copyYaml = async () => {
    try {
      await navigator.clipboard.writeText(yaml);
      alert('Copied!');
    } catch {
      alert('Failed to copy. Please select and copy manually.');
    }
  };

  const nextStep = () => {
    console.log("Saving YAML to localStorage and proceeding to next step...");
    const configYaml = yaml; // Assuming yaml is already a string
    console.log("YAML content: ", configYaml);

    localStorage.setItem('configYaml', configYaml);
    fun_run(configYaml);
  }


  const downloadYaml = () => {
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const a = document.createElement('a');
    a.download = 'config.yaml';
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex flex-col h-screen config-generator">
      {/* Header */}
      <header className="bg-[#24292e] text-white px-8 py-3.5 flex justify-between items-center">
        <h1 className="m-0 text-xl">PyAETNA v3.2 — Config Generator</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Form Panel */}
        <div className="flex-1 px-8 py-6 overflow-y-auto bg-white border-r border-[#d1d5da]">
          {/* Quick Start */}
          <h2 className="border-b border-[#d1d5da] pb-1.5 mt-7 mb-2.5 text-lg">Quick Start</h2>
          <div className="mb-3.5">
            <div className="text-xs text-[#586069] leading-tight">
              Fill in the fields below; the YAML preview updates in real time.
              Use <strong>Copy</strong> or <strong>Download</strong> to export.
              Badges indicate each parameter's scope:
              <Badge variant="global">Global</Badge>
              <Badge variant="visit">Per-visit</Badge>
              <Badge variant="instrument">Per-instrument</Badge>
              <Badge variant="required">Required</Badge>
            </div>
          </div>

          {/* Data Section */}
          <h2 className="border-b border-[#d1d5da] pb-1.5 mt-7 mb-2.5 text-lg">
            Data <Badge variant="required">Required</Badge>
          </h2>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">working_dir</label>
            <input
              disabled
              type="text"
              value={config.workingDir}
              onChange={(e) => setConfig({ ...config, workingDir: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Working directory. All relative paths are resolved from here.
            </div>
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">file_path</label>
            <input
              type="text"
              value={config.filePath}
              onChange={(e) => setConfig({ ...config, filePath: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Whitespace-delimited data file. Required columns: BJD, Y, SIGMA.
              Optional: EXPTIME (default 0), VISIT (default 1), INSTRUMENT (default 1).
              Any extra column (ROLL_ANGLE, CENTROID_X, …) becomes a detrending basis vector.
            </div>
          </div>

          {/* Instruments Section */}
          <h2 className="border-b border-[#d1d5da] pb-1.5 mt-7 mb-2.5 text-lg">
            Instruments <Badge variant="required">Required</Badge>
          </h2>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">instruments (comma-separated)</label>
            <input
              type="text"
              value={config.instruments}
              onChange={(e) => setConfig({ ...config, instruments: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Names matching the INSTRUMENT column in the data file. Order matters for per_instrument scope.
            </div>
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">data_type (comma-separated, one per instrument)</label>
            <input
              type="text"
              value={config.dataTypes}
              onChange={(e) => setConfig({ ...config, dataTypes: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              LC (light curve) or RV (radial velocity), one entry per instrument.
            </div>
          </div>

          {/* MCMC Section */}
          <h2 className="border-b border-[#d1d5da] pb-1.5 mt-7 mb-2.5 text-lg">
            MCMC <Badge variant="global">Global</Badge> <Badge variant="required">Required</Badge>
          </h2>
          
          <h3 className="mt-4 mb-1.5 text-base text-[#444]">Ensemble Warmup (Phase 1)</h3>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">warmup_sampler</label>
            <select
              value={config.warmupSampler}
              onChange={(e) => setConfig({ ...config, warmupSampler: e.target.value as 'ess' | 'aies' })}
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            >
              <option value="ess">ESS (Ensemble Slice Sampling)</option>
              <option value="aies">AIES (Affine Invariant)</option>
            </select>
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Gradient-free ensemble sampler for initial posterior exploration.
            </div>
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">num_chains_ensemble</label>
            <input
              type="number"
              value={config.numChainsEnsemble}
              onChange={(e) => setConfig({ ...config, numChainsEnsemble: Number(e.target.value) })}
              min="2"
              step="2"
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Number of ensemble walkers. Must be ≥ 2×n_free_params and even. Auto-adjusted upward if too small.
            </div>
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">num_warmup</label>
            <input
              type="number"
              value={config.numWarmup}
              onChange={(e) => setConfig({ ...config, numWarmup: Number(e.target.value) })}
              min="1"
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Number of ensemble warmup iterations.
            </div>
          </div>

          <h3 className="mt-4 mb-1.5 text-base text-[#444]">Convergence Test (Phase 2)</h3>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">chain_energy_threshold</label>
            <input
              type="number"
              value={config.chainEnergyThreshold}
              onChange={(e) => setConfig({ ...config, chainEnergyThreshold: Number(e.target.value) })}
              step="0.5"
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Energy-range threshold for uni-/multi-modal detection after warmup.
            </div>
          </div>

          <h3 className="mt-4 mb-1.5 text-base text-[#444]">NUTS Production — if unimodal (Phase 3a)</h3>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">num_chains_if_nuts</label>
            <input
              type="number"
              value={config.numChainsIfNuts}
              onChange={(e) => setConfig({ ...config, numChainsIfNuts: Number(e.target.value) })}
              min="1"
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              NUTS chains initialised from best ESS walker position.
            </div>
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">internal_warmup_if_nuts</label>
            <input
              type="number"
              value={config.internalWarmupIfNuts}
              onChange={(e) => setConfig({ ...config, internalWarmupIfNuts: Number(e.target.value) })}
              min="1"
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              NUTS step-size adaptation iterations (≥ 500 recommended).
            </div>
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">num_samples_if_nuts</label>
            <input
              type="number"
              value={config.numSamplesIfNuts}
              onChange={(e) => setConfig({ ...config, numSamplesIfNuts: Number(e.target.value) })}
              min="1"
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Production samples per NUTS chain.
            </div>
          </div>

          <h3 className="mt-4 mb-1.5 text-base text-[#444]">Ensemble Production — if multimodal (Phase 3b)</h3>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">num_samples_if_ensemble</label>
            <input
              type="number"
              value={config.numSamplesIfEnsemble}
              onChange={(e) => setConfig({ ...config, numSamplesIfEnsemble: Number(e.target.value) })}
              min="1"
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Production samples per walker when the posterior is multimodal.
            </div>
          </div>

          <h3 className="mt-4 mb-1.5 text-base text-[#444]">NUTS Tuning</h3>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">target_accept_prob</label>
            <input
              type="number"
              value={config.targetAcceptProb}
              onChange={(e) => setConfig({ ...config, targetAcceptProb: Number(e.target.value) })}
              step="0.01"
              min="0.5"
              max="0.99"
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Higher → smaller steps, better exploration but slower.
            </div>
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">max_tree_depth</label>
            <input
              type="number"
              value={config.maxTreeDepth}
              onChange={(e) => setConfig({ ...config, maxTreeDepth: Number(e.target.value) })}
              min="5"
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Max NUTS trajectory length. Higher allows longer trajectories but uses more memory.
            </div>
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">use_float64</label>
            <select
              value={config.useFloat64}
              onChange={(e) => setConfig({ ...config, useFloat64: e.target.value as 'auto' | 'true' | 'false' })}
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            >
              <option value="auto">auto</option>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              <em>auto</em>: decide from ephemeris parameters.
              <em>true</em>: always float64 (slower, higher precision).
              <em>false</em>: always float32 (fastest).
            </div>
          </div>

          <h3 className="mt-4 mb-1.5 text-base text-[#444]">Checkpointing & Reproducibility</h3>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">checkpoint_interval</label>
            <input
              type="number"
              value={config.checkpointInterval}
              onChange={(e) => setConfig({ ...config, checkpointInterval: Number(e.target.value) })}
              min="1"
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Save checkpoint every N samples. Allows resuming interrupted runs.
            </div>
          </div>
          <div className="mb-3.5 flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={config.reset}
              onChange={(e) => setConfig({ ...config, reset: e.target.checked })}
              className="w-auto"
            />
            <label className="m-0 font-normal">reset (discard existing checkpoint)</label>
          </div>
          <div className="text-xs text-[#586069] ml-5 leading-tight mb-3.5">
            Uncheck to resume from the last checkpoint.
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">random_seed (optional)</label>
            <input
              type="text"
              value={config.randomSeed}
              onChange={(e) => setConfig({ ...config, randomSeed: e.target.value })}
              placeholder="null (random each run)"
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Integer for reproducible runs. Leave empty for system-time seed.
            </div>
          </div>
          <div className="mb-3.5 flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={config.denseMass}
              onChange={(e) => setConfig({ ...config, denseMass: e.target.checked })}
              className="w-auto"
            />
            <label className="m-0 font-normal">dense_mass (use full mass matrix for NUTS)</label>
          </div>
          <div className="text-xs text-[#586069] ml-5 leading-tight mb-3.5">
            Optional. Default diagonal. Check for highly correlated posteriors.
          </div>

          {/* Reports Section */}
          <h2 className="border-b border-[#d1d5da] pb-1.5 mt-7 mb-2.5 text-lg">
            Reports <Badge variant="global">Global</Badge> <Badge variant="required">Required</Badge>
          </h2>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">discard_extra_warmup</label>
            <input
              type="number"
              value={config.discardExtraWarmup}
              onChange={(e) => setConfig({ ...config, discardExtraWarmup: Number(e.target.value) })}
              min="0"
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Additional samples discarded from chain start for plots/statistics (does not re-run sampling).
            </div>
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">trace_max_points</label>
            <input
              type="text"
              value={config.traceMaxPoints}
              onChange={(e) => setConfig({ ...config, traceMaxPoints: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Max points per trace plot. Integer or "all" (can be slow).
            </div>
          </div>

          {/* Detrending Section */}
          <h2 className="border-b border-[#d1d5da] pb-1.5 mt-7 mb-2.5 text-lg">Detrending</h2>
          
          <h3 className="mt-4 mb-1.5 text-base text-[#444]">
            Normalization <Badge variant="required">Required</Badge>
          </h3>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">normalization_mode</label>
            <select
              value={config.normalizationMode}
              onChange={(e) => setConfig({ ...config, normalizationMode: e.target.value as 'multiplicative' | 'additive' })}
              className="w-full px-2.5 py-1.5 border border-[#d1d5da] rounded-md text-sm"
            >
              <option value="multiplicative">multiplicative (norm × model)</option>
              <option value="additive">additive (norm + model)</option>
            </select>
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              How the normalization baseline is combined with the model.
              For RV instruments, normalization is the systemic velocity (γ) and is always additive.
            </div>
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">normalization — scope</label>
            <ScopeSelector
              value={config.normalizationScope}
              onChange={(scope) => setConfig({ ...config, normalizationScope: scope })}
            />
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">normalization — prior</label>
            <PriorInput
              value={config.normalization}
              onChange={(normalization) => setConfig({ ...config, normalization })}
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Baseline correction. Multiplicative: centre near 1.0; additive: centre near 0.0.
              c0 is not supported — use normalization for the baseline offset.
            </div>
          </div>
          <div className="mb-3.5 flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={config.rollAngleUnfold}
              onChange={(e) => setConfig({ ...config, rollAngleUnfold: e.target.checked })}
              className="w-auto"
            />
            <label className="m-0 font-normal">rollAngleUnfold (unwrap 0–360° to continuous)</label>
          </div>
          <div className="text-xs text-[#586069] ml-5 leading-tight mb-3.5">
            Useful when ROLL_ANGLE wraps during a visit.
          </div>

          <h3 className="mt-4 mb-1.5 text-base text-[#444]">
            Polynomials <Badge variant="visit">Per-visit default</Badge>
          </h3>
          {config.polynomials.map((poly, index) => (
            <PolynomialEditor
              key={poly.id}
              polynomial={poly}
              onChange={(updated) => {
                const newPolys = [...config.polynomials];
                newPolys[index] = updated;
                setConfig({ ...config, polynomials: newPolys });
              }}
              onRemove={() => {
                setConfig({ ...config, polynomials: config.polynomials.filter((_, i) => i !== index) });
              }}
            />
          ))}
          <button
            onClick={addPolynomial}
            className="bg-[#2ea44f] text-white border-none rounded-md px-3 py-1.5 cursor-pointer text-sm mb-2.5"
          >
            + Add Polynomial
          </button>
          <div className="text-xs text-[#586069] leading-tight mb-3.5">
            Polynomial detrending against auxiliary variables.
            c0 is not allowed (use normalization). Start from c1 (linear).
          </div>

          <h3 className="mt-4 mb-1.5 text-base text-[#444]">
            Fourier Series <Badge variant="visit">Per-visit default</Badge>
          </h3>
          {config.fouriers.map((four, index) => (
            <FourierEditor
              key={four.id}
              fourier={four}
              onChange={(updated) => {
                const newFours = [...config.fouriers];
                newFours[index] = updated;
                setConfig({ ...config, fouriers: newFours });
              }}
              onRemove={() => {
                setConfig({ ...config, fouriers: config.fouriers.filter((_, i) => i !== index) });
              }}
            />
          ))}
          <button
            onClick={addFourier}
            className="bg-[#2ea44f] text-white border-none rounded-md px-3 py-1.5 cursor-pointer text-sm mb-2.5"
          >
            + Add Fourier Term
          </button>
          <div className="text-xs text-[#586069] leading-tight mb-3.5">
            Periodic sin/cos detrending. Each harmonic c_k produces two parameters: name_ck_s and name_ck_c.
          </div>

          <h3 className="mt-4 mb-1.5 text-base text-[#444]">
            Gaussian Processes <Badge variant="global">Global</Badge> / <Badge variant="instrument">Per-instrument</Badge>
          </h3>
          {config.gps.map((gp, index) => (
            <GPEditor
              key={gp.id}
              gp={gp}
              onChange={(updated) => {
                const newGPs = [...config.gps];
                newGPs[index] = updated;
                setConfig({ ...config, gps: newGPs });
              }}
              onRemove={() => {
                setConfig({ ...config, gps: config.gps.filter((_, i) => i !== index) });
              }}
            />
          ))}
          <button
            onClick={addGP}
            className="bg-[#2ea44f] text-white border-none rounded-md px-3 py-1.5 cursor-pointer text-sm mb-2.5"
          >
            + Add GP Term
          </button>
          <div className="text-xs text-[#586069] leading-tight mb-3.5">
            Non-parametric noise modelling via tinygp. Each GP section must declare its target
            instruments. Multiple GPs per instrument are summed.
          </div>

          {/* Jitter Section */}
          <h2 className="border-b border-[#d1d5da] pb-1.5 mt-7 mb-2.5 text-lg">
            log_jitter <Badge variant="required">Required</Badge>
          </h2>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">Scope</label>
            <ScopeSelector
              value={config.jitterScope}
              onChange={(scope) => setConfig({ ...config, jitterScope: scope })}
            />
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">Prior</label>
            <PriorInput
              value={config.jitter}
              onChange={(jitter) => setConfig({ ...config, jitter })}
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Additional white noise in log-scale: σ² = σ_orig² + exp(2·log_jitter).
              Use <code>-jnp.inf</code> (fixed) to disable jitter entirely.
            </div>
          </div>

          {/* Star Section */}
          <h2 className="border-b border-[#d1d5da] pb-1.5 mt-7 mb-2.5 text-lg">
            Stellar Parameters <Badge variant="global">Global</Badge>
          </h2>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">
              rho_star — stellar density [g/cm³] <Badge variant="required">Required</Badge>
            </label>
            <PriorInput
              value={config.rhoStar}
              onChange={(rhoStar) => setConfig({ ...config, rhoStar })}
            />
            <div className="text-xs text-[#586069] mt-0.5 leading-tight">
              Global only. Controls orbital scale (a/R★). Use truncnorm for constrained priors.
            </div>
          </div>

          <h3 className="mt-4 mb-1.5 text-base text-[#444]">Limb Darkening — Kipping (q1, q2)</h3>
          <div className="text-xs text-[#586069] leading-tight mb-3.5">
            Required when LC instruments are present. May be omitted for RV-only fits.
            Scopes: global or per_instrument.
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">q1 — scope</label>
            <ScopeSelector
              value={config.q1Scope}
              onChange={(scope) => setConfig({ ...config, q1Scope: scope })}
            />
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">q1 — prior</label>
            <PriorInput
              value={config.q1}
              onChange={(q1) => setConfig({ ...config, q1 })}
            />
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">q2 — scope</label>
            <ScopeSelector
              value={config.q2Scope}
              onChange={(scope) => setConfig({ ...config, q2Scope: scope })}
            />
          </div>
          <div className="mb-3.5">
            <label className="block font-semibold mb-0.5 text-sm">q2 — prior</label>
            <PriorInput
              value={config.q2}
              onChange={(q2) => setConfig({ ...config, q2 })}
            />
          </div>

          {/* Planet Section */}
          <h2 className="border-b border-[#d1d5da] pb-1.5 mt-7 mb-2.5 text-lg">
            Planet Parameters <Badge variant="global">Global</Badge>
          </h2>
          <div className="text-xs text-[#586069] leading-tight mb-3.5">
            Planets are auto-detected by top-level keys starting with <code>planet_</code>.
            Zero or more planets are supported.
          </div>
          {config.planets.map((planet, index) => (
            <PlanetEditor
              key={planet.id}
              planet={planet}
              onChange={(updated) => {
                const newPlanets = [...config.planets];
                newPlanets[index] = updated;
                setConfig({ ...config, planets: newPlanets });
              }}
              onRemove={() => {
                setConfig({ ...config, planets: config.planets.filter((_, i) => i !== index) });
              }}
            />
          ))}
          <button
            onClick={addPlanet}
            className="bg-[#2ea44f] text-white border-none rounded-md px-3 py-1.5 cursor-pointer text-sm mb-2.5"
          >
            + Add Planet
          </button>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 px-8 py-6 flex flex-col bg-[#f6f8fa]">
          <h2 className="border-b border-[#d1d5da] pb-1.5 mt-0 mb-2.5 text-lg">Generated YAML</h2>
          <textarea
            value={yaml}
            readOnly
            className="flex-1 w-full font-mono text-sm p-3.5 border border-[#d1d5da] rounded-md bg-white resize-none"
          />
          <div className="mt-3.5 flex gap-2.5">
            <button
              onClick={copyYaml}
              className="px-3.5 py-1.5 bg-[#0366d6] text-white border-none rounded-md cursor-pointer font-semibold text-sm hover:bg-[#0255b3]"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={nextStep}
              className="px-3.5 py-1.5 border border-[#d1d5da] bg-white rounded-md cursor-pointer font-semibold text-sm hover:bg-[#f3f4f6]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function createDefaultPlanet(suffix: string): Planet {
  return {
    id: Math.random().toString(36),
    suffix,
    ephemerisMode: 'ref',
    tauRef: '59445.1',
    deltaTau: { dist: 'truncnorm', params: '-0.001, 0.001, 0, 0.00019' },
    periodRef: '3.47409932',
    deltaPeriod: { dist: 'truncnorm', params: '-1e-5, 1e-5, 0, 4e-6' },
    tau: { dist: 'uniform', params: '59445.0, 59445.3' },
    period: { dist: 'uniform', params: '3.47, 3.48' },
    impact: { dist: 'uniform', params: '0.0, 0.8' },
    rpByRs: { dist: 'uniform', params: '0.08, 0.16' },
    ecos: '0.0',
    esin: '0.0',
    ampNight: '0.0',
    ampDayMinusAmpNight: '0.0',
    ampBeam: '0.0',
    ampEllip: '0.0',
    phoffset: '0.0',
    tidallag: '0.0',
    kRV: '1.0',
  };
}