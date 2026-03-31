import { ConfigState, Prior, DistType, ScopeType } from './types';

// Format a prior for YAML output
export function formatPrior(dist: DistType, params: string): string {
  if (dist === 'fixed') return params || '0';
  if (!params) return 'null';
  return `[${dist}, ${params}]`;
}

// Format a scoped prior: [scope, dist, p1, p2] or scalar
export function formatScoped(scope: ScopeType, dist: DistType, params: string): string {
  if (dist === 'fixed') return params || '0';
  if (scope === 'global') return `[global, ${dist}, ${params}]`;
  if (scope === 'per_visit') return `[per_visit, ${dist}, ${params}]`;
  return `[${dist}, ${params}]`;
}

// Generate YAML from config state
export function generateYAML(config: ConfigState): string {
  let yaml = '# PyAETNA v3.2 — Generated Configuration\n\n';

  // Data section
  yaml += `data:\n`;
  yaml += `  working_dir: ${config.workingDir}\n`;
  yaml += `  file_path: ${config.filePath}\n\n`;

  // Instruments
  const instArr = config.instruments.split(',').map(s => s.trim()).filter(Boolean);
  const dtArr = config.dataTypes.split(',').map(s => s.trim()).filter(Boolean);
  yaml += `instruments: [${instArr.join(', ')}]\n`;
  yaml += `data_type: [${dtArr.join(', ')}]\n\n`;

  // MCMC
  yaml += `mcmc:\n`;
  yaml += `  warmup_sampler: ${config.warmupSampler}\n`;
  yaml += `  num_chains_ensemble: ${config.numChainsEnsemble}\n`;
  yaml += `  num_warmup: ${config.numWarmup}\n`;
  yaml += `  chain_energy_threshold: ${config.chainEnergyThreshold}\n`;
  yaml += `  num_chains_if_nuts: ${config.numChainsIfNuts}\n`;
  yaml += `  internal_warmup_if_nuts: ${config.internalWarmupIfNuts}\n`;
  yaml += `  num_samples_if_nuts: ${config.numSamplesIfNuts}\n`;
  yaml += `  num_samples_if_ensemble: ${config.numSamplesIfEnsemble}\n`;
  yaml += `  target_accept_prob: ${config.targetAcceptProb}\n`;
  yaml += `  max_tree_depth: ${config.maxTreeDepth}\n`;
  yaml += `  use_float64: ${config.useFloat64}\n`;
  yaml += `  checkpoint_interval: ${config.checkpointInterval}\n`;
  yaml += `  reset: ${config.reset}\n`;
  yaml += `  random_seed: ${config.randomSeed || 'null'}\n`;
  if (config.denseMass) yaml += `  dense_mass: true\n`;
  yaml += `\n`;

  // Reports
  yaml += `reports:\n`;
  yaml += `  discard_extra_warmup: ${config.discardExtraWarmup}\n`;
  yaml += `  trace_max_points: ${config.traceMaxPoints}\n\n`;

  // Detrending
  yaml += `detrending:\n`;
  yaml += `  normalization_mode: ${config.normalizationMode}\n`;
  yaml += `  normalization: ${formatScoped(config.normalizationScope, config.normalization.dist, config.normalization.params)}\n`;
  if (config.rollAngleUnfold) yaml += `  rollAngleUnfold: true\n`;

  // Polynomials
  if (config.polynomials.length > 0) {
    yaml += `\n  polynomials:\n`;
    config.polynomials.forEach(poly => {
      yaml += `    ${poly.name}:\n`;
      yaml += `      scope: ${poly.scope}\n`;
      yaml += `      x_variable: ${poly.xVariable}\n`;
      if (poly.c1.dist !== 'fixed') {
        yaml += `      c1: ${formatPrior(poly.c1.dist, poly.c1.params)}\n`;
      } else {
        yaml += `      c1: ${poly.c1.params}\n`;
      }
      poly.degrees.forEach(deg => {
        if (deg.prior.dist !== 'fixed') {
          yaml += `      c${deg.degree}: ${formatPrior(deg.prior.dist, deg.prior.params)}\n`;
        } else {
          yaml += `      c${deg.degree}: ${deg.prior.params}\n`;
        }
      });
    });
  }

  // Fourier
  if (config.fouriers.length > 0) {
    yaml += `\n  fourier:\n`;
    config.fouriers.forEach(four => {
      yaml += `    ${four.name}:\n`;
      yaml += `      scope: ${four.scope}\n`;
      yaml += `      x_variable: ${four.xVariable}\n`;
      yaml += `      period: ${four.period}\n`;
      if (four.c1.dist !== 'fixed') {
        yaml += `      c1: ${formatPrior(four.c1.dist, four.c1.params)}\n`;
      } else {
        yaml += `      c1: ${four.c1.params}\n`;
      }
    });
  }

  // GP
  if (config.gps.length > 0) {
    yaml += `\n  GP:\n`;
    config.gps.forEach(gp => {
      yaml += `    ${gp.name}:\n`;
      const instList = gp.instruments.split(',').map(s => s.trim()).join(', ');
      yaml += `      instruments: [${instList}]\n`;
      yaml += `      kernel: ${gp.kernel}\n`;
      yaml += `      x_variable: ${gp.xVariable}\n`;
      if (gp.perVisit) yaml += `      per_visit: true\n`;
      Object.entries(gp.hyperparams).forEach(([name, prior]) => {
        if (prior.dist === 'fixed') {
          yaml += `      ${name}: ${prior.params}\n`;
        } else {
          yaml += `      ${name}: ${formatPrior(prior.dist, prior.params)}\n`;
        }
      });
    });
  }
  yaml += `\n`;

  // Jitter
  yaml += `log_jitter: ${formatScoped(config.jitterScope, config.jitter.dist, config.jitter.params)}\n\n`;

  // Star
  yaml += `star:\n`;
  if (config.rhoStar.dist === 'fixed') {
    yaml += `  rho_star: ${config.rhoStar.params}\n`;
  } else {
    yaml += `  rho_star: [global, ${config.rhoStar.dist}, ${config.rhoStar.params}]\n`;
  }

  // q1
  if (config.q1.dist === 'fixed') {
    yaml += `  q1: ${config.q1.params}\n`;
  } else {
    yaml += `  q1: [${config.q1Scope}, ${config.q1.dist}, ${config.q1.params}]\n`;
  }

  // q2
  if (config.q2.dist === 'fixed') {
    yaml += `  q2: ${config.q2.params}\n`;
  } else {
    yaml += `  q2: [${config.q2Scope}, ${config.q2.dist}, ${config.q2.params}]\n`;
  }
  yaml += `\n`;

  // Planets
  config.planets.forEach(planet => {
    yaml += `planet_${planet.suffix}:\n`;
    if (planet.ephemerisMode === 'ref') {
      yaml += `  tau_ref: ${planet.tauRef}\n`;
      if (planet.deltaTau.dist === 'fixed') {
        yaml += `  delta_tau: ${planet.deltaTau.params}\n`;
      } else {
        yaml += `  delta_tau: [global, ${planet.deltaTau.dist}, ${planet.deltaTau.params}]\n`;
      }
      yaml += `  period_ref: ${planet.periodRef}\n`;
      if (planet.deltaPeriod.dist === 'fixed') {
        yaml += `  delta_period: ${planet.deltaPeriod.params}\n`;
      } else {
        yaml += `  delta_period: [global, ${planet.deltaPeriod.dist}, ${planet.deltaPeriod.params}]\n`;
      }
    } else {
      if (planet.tau.dist === 'fixed') {
        yaml += `  tau: ${planet.tau.params}\n`;
      } else {
        yaml += `  tau: [global, ${planet.tau.dist}, ${planet.tau.params}]\n`;
      }
      if (planet.period.dist === 'fixed') {
        yaml += `  period: ${planet.period.params}\n`;
      } else {
        yaml += `  period: [global, ${planet.period.dist}, ${planet.period.params}]\n`;
      }
    }
    if (planet.impact.dist === 'fixed') {
      yaml += `  impact: ${planet.impact.params}\n`;
    } else {
      yaml += `  impact: [global, ${planet.impact.dist}, ${planet.impact.params}]\n`;
    }
    if (planet.rpByRs.dist === 'fixed') {
      yaml += `  rp_by_rs: ${planet.rpByRs.params}\n`;
    } else {
      yaml += `  rp_by_rs: [global, ${planet.rpByRs.dist}, ${planet.rpByRs.params}]\n`;
    }
    yaml += `  ecos: ${planet.ecos}\n`;
    yaml += `  esin: ${planet.esin}\n`;
    yaml += `  amp_night: ${planet.ampNight}\n`;
    yaml += `  amp_day_minus_amp_night: ${planet.ampDayMinusAmpNight}\n`;
    yaml += `  amp_beam: ${planet.ampBeam}\n`;
    yaml += `  amp_ellip: ${planet.ampEllip}\n`;
    yaml += `  phoffset: ${planet.phoffset}\n`;
    yaml += `  tidallag: ${planet.tidallag}\n`;
    yaml += `  kRV: ${planet.kRV}\n`;
    yaml += `\n`;
  });

  return yaml;
}
