// Distribution types
export type DistType = 'fixed' | 'uniform' | 'normal' | 'truncnorm' | 'lognormal' | 'beta' | 'gamma' | 'cauchy' | 'exponential' | 'studentt' | 'laplace';

export interface Distribution {
  v: DistType;
  l: string;
}

export const DISTRIBUTIONS: Distribution[] = [
  { v: 'fixed', l: 'Fixed (scalar)' },
  { v: 'uniform', l: 'Uniform [lo, hi]' },
  { v: 'normal', l: 'Normal [μ, σ]' },
  { v: 'truncnorm', l: 'TruncNorm [lo, hi, μ, σ]' },
  { v: 'lognormal', l: 'LogNormal [μ, σ]' },
  { v: 'beta', l: 'Beta [α, β]' },
  { v: 'gamma', l: 'Gamma [conc, rate]' },
  { v: 'cauchy', l: 'Cauchy [loc, scale]' },
  { v: 'exponential', l: 'Exponential [rate]' },
  { v: 'studentt', l: 'StudentT [df, loc, scale]' },
  { v: 'laplace', l: 'Laplace [loc, scale]' },
];

// Scope types
export type ScopeType = 'global' | 'per_visit' | 'per_instrument';

// Prior interface
export interface Prior {
  dist: DistType;
  params: string;
}

// Polynomial interface
export interface Polynomial {
  id: string;
  name: string;
  xVariable: string;
  scope: ScopeType;
  c1: Prior;
  degrees: Array<{ degree: number; prior: Prior }>;
}

// Fourier interface
export interface Fourier {
  id: string;
  name: string;
  xVariable: string;
  period: string;
  scope: ScopeType;
  c1: Prior;
}

// GP Hyperparameter
export interface GPHyperParam {
  n: string;
  d: DistType;
  p: string;
  h: string;
}

// GP Kernel types
export type KernelType = 'Matern32' | 'Matern52' | 'Matern32_quasisep' | 'Matern52_quasisep' | 'ExpSquared' | 'ExpSineSquared' | 'QuasiPeriodic' | 'SHO' | 'SHO_Quality' | 'Constant';

export const KERNELS: Record<KernelType, GPHyperParam[]> = {
  Matern32: [
    { n: 'log_gp_amp', d: 'uniform', p: '-8, -4', h: 'Log amplitude (controls GP variance)' },
    { n: 'log_gp_scale', d: 'uniform', p: '1, 8', h: 'Log length-scale (correlation length)' }
  ],
  Matern52: [
    { n: 'log_gp_amp', d: 'uniform', p: '-8, -4', h: 'Log amplitude' },
    { n: 'log_gp_scale', d: 'uniform', p: '1, 8', h: 'Log length-scale' }
  ],
  Matern32_quasisep: [
    { n: 'log_gp_amp', d: 'uniform', p: '-8, -4', h: 'Log amplitude (O(N) scalable)' },
    { n: 'log_gp_scale', d: 'uniform', p: '1, 8', h: 'Log length-scale' }
  ],
  Matern52_quasisep: [
    { n: 'log_gp_amp', d: 'uniform', p: '-8, -4', h: 'Log amplitude (O(N) scalable)' },
    { n: 'log_gp_scale', d: 'uniform', p: '1, 8', h: 'Log length-scale' }
  ],
  ExpSquared: [
    { n: 'log_gp_amp', d: 'uniform', p: '-8, -4', h: 'Log amplitude (RBF/SE kernel)' },
    { n: 'log_gp_scale', d: 'uniform', p: '1, 8', h: 'Log length-scale' }
  ],
  ExpSineSquared: [
    { n: 'log_gp_amp', d: 'uniform', p: '-8, -5', h: 'Log amplitude' },
    { n: 'gp_freq', d: 'fixed', p: '0.5/jnp.pi', h: 'Frequency (linear scale, not log)' },
    { n: 'log_gp_gamma', d: 'uniform', p: '-5, 5', h: 'Log gamma (damping)' }
  ],
  QuasiPeriodic: [
    { n: 'log_gp_amp', d: 'uniform', p: '-8, -5', h: 'Log amplitude' },
    { n: 'log_gp_se_scale', d: 'uniform', p: '6, 10', h: 'Log SE envelope scale' },
    { n: 'gp_freq', d: 'fixed', p: '0.5/jnp.pi', h: 'Frequency (linear scale)' },
    { n: 'log_gp_gamma', d: 'uniform', p: '-5, 5', h: 'Log gamma (damping)' }
  ],
  SHO: [
    { n: 'log_gp_sigma', d: 'uniform', p: '-8, -4', h: 'Log sigma (SHO variability)' },
    { n: 'gp_freq', d: 'fixed', p: '0.5/jnp.pi', h: 'Frequency (converted to ω=2πf)' },
    { n: 'log_gp_lengthscale', d: 'uniform', p: '1, 8', h: 'Log damping timescale τ' }
  ],
  SHO_Quality: [
    { n: 'log_gp_sigma', d: 'uniform', p: '-8, -4', h: 'Log sigma' },
    { n: 'gp_freq', d: 'fixed', p: '0.5/jnp.pi', h: 'Frequency' },
    { n: 'gp_quality', d: 'fixed', p: '0.3', h: 'Quality factor Q (higher → less damping)' }
  ],
  Constant: [
    { n: 'log_gp_const', d: 'uniform', p: '-10, -5', h: 'Log constant added to diagonal' }
  ],
};

// GP interface
export interface GP {
  id: string;
  name: string;
  instruments: string;
  kernel: KernelType;
  xVariable: string;
  perVisit: boolean;
  hyperparams: Record<string, Prior>;
}

// Planet interface
export interface Planet {
  id: string;
  suffix: string;
  ephemerisMode: 'ref' | 'direct';
  tauRef: string;
  deltaTau: Prior;
  periodRef: string;
  deltaPeriod: Prior;
  tau: Prior;
  period: Prior;
  impact: Prior;
  rpByRs: Prior;
  ecos: string;
  esin: string;
  ampNight: string;
  ampDayMinusAmpNight: string;
  ampBeam: string;
  ampEllip: string;
  phoffset: string;
  tidallag: string;
  kRV: string;
}

// Main config state
export interface ConfigState {
  // Data
  workingDir: string;
  filePath: string;

  // Instruments
  instruments: string;
  dataTypes: string;

  // MCMC
  warmupSampler: 'ess' | 'aies';
  numChainsEnsemble: number;
  numWarmup: number;
  chainEnergyThreshold: number;
  numChainsIfNuts: number;
  internalWarmupIfNuts: number;
  numSamplesIfNuts: number;
  numSamplesIfEnsemble: number;
  targetAcceptProb: number;
  maxTreeDepth: number;
  useFloat64: 'auto' | 'true' | 'false';
  checkpointInterval: number;
  reset: boolean;
  randomSeed: string;
  denseMass: boolean;

  // Reports
  discardExtraWarmup: number;
  traceMaxPoints: string;

  // Detrending
  normalizationMode: 'multiplicative' | 'additive';
  normalizationScope: ScopeType;
  normalization: Prior;
  rollAngleUnfold: boolean;
  polynomials: Polynomial[];
  fouriers: Fourier[];
  gps: GP[];

  // Jitter
  jitterScope: ScopeType;
  jitter: Prior;

  // Star
  rhoStar: Prior;
  q1Scope: ScopeType;
  q1: Prior;
  q2Scope: ScopeType;
  q2: Prior;

  // Planets
  planets: Planet[];
}
