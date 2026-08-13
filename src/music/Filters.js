export const FILTERS = {
  bassboost: { equalizer: [{ band: 0, gain: 0.25 }, { band: 1, gain: 0.2 }, { band: 2, gain: 0.15 }] },
  nightcore: { timescale: { speed: 1.2, pitch: 1.2, rate: 1.0 } },
  vaporwave: { timescale: { speed: 0.85, pitch: 0.8, rate: 1.0 } },
  '8d': { rotation: { rotationHz: 0.2 } },
  karaoke: { karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 } },
  tremolo: { tremolo: { frequency: 2.0, depth: 0.5 } },
  vibrato: { vibrato: { frequency: 2.0, depth: 0.5 } }
};

export default FILTERS;
