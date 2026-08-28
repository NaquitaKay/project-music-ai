import { Note } from "tonal";

// Autocorrelation-based pitch detector (ACF2+): finds the lag that best
// repeats the waveform, then refines it with parabolic interpolation around
// the peak so the estimate isn't quantized to whole samples.
// `rms` is passed in rather than recomputed - callers already need it for
// their own silence/level checks, and it's an O(n) pass over the buffer.
export function autoCorrelate(
  buffer: Float32Array,
  sampleRate: number,
  rms: number,
): number {
  const size = buffer.length;

  if (rms < 0.01) return -1;

  // Trim near-silent leading/trailing samples so the correlation window
  // centers on the actual signal.
  const threshold = 0.2;
  let start = 0;
  let end = size - 1;
  for (let i = 0; i < size / 2; i++) {
    if (Math.abs(buffer[i] ?? 0) >= threshold) {
      start = i;
      break;
    }
  }
  for (let i = 0; i < size / 2; i++) {
    const index = size - 1 - i;
    if (Math.abs(buffer[index] ?? 0) >= threshold) {
      end = index;
      break;
    }
  }

  const trimmed = buffer.slice(start, end);
  const n = trimmed.length;
  if (n < 2) return -1;

  const correlations = new Array<number>(n).fill(0);
  for (let lag = 0; lag < n; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) {
      sum += (trimmed[i] ?? 0) * (trimmed[i + lag] ?? 0);
    }
    correlations[lag] = sum;
  }

  // Skip the initial downslope from lag 0 (always the max) to find the
  // first real correlation peak.
  let lag = 0;
  while (
    lag < n - 1 &&
    (correlations[lag] ?? 0) > (correlations[lag + 1] ?? 0)
  ) {
    lag++;
  }

  let bestLag = -1;
  let bestValue = -1;
  for (let i = lag; i < n; i++) {
    const value = correlations[i] ?? 0;
    if (value > bestValue) {
      bestValue = value;
      bestLag = i;
    }
  }
  if (bestLag <= 0) return -1;

  const prev = correlations[bestLag - 1] ?? correlations[bestLag] ?? 0;
  const curr = correlations[bestLag] ?? 0;
  const next = correlations[bestLag + 1] ?? correlations[bestLag] ?? 0;
  const a = (prev + next - 2 * curr) / 2;
  const b = (next - prev) / 2;
  const refinedLag = a !== 0 ? bestLag - b / (2 * a) : bestLag;

  if (refinedLag <= 0) return -1;
  return sampleRate / refinedLag;
}

// Roughly the range of a hummed/sung note (low bass to high soprano).
export const MIN_VOICE_HZ = 70;
export const MAX_VOICE_HZ = 1100;

export function isPlausibleVoiceFrequency(frequency: number): boolean {
  return frequency >= MIN_VOICE_HZ && frequency <= MAX_VOICE_HZ;
}

const GRID_MIN_MIDI = Note.midi("C3") ?? 48;
const GRID_MAX_MIDI = Note.midi("B4") ?? 71;

// The note grid only shows C3-B4, so fold a detected pitch into that range
// by octave (keeps the pitch class - what matters for chord fit - intact).
export function frequencyToGridNote(frequency: number): string | null {
  if (!isPlausibleVoiceFrequency(frequency)) return null;

  const noteName = Note.fromFreqSharps(frequency);
  let midi = Note.midi(noteName);
  if (midi === null) return null;

  while (midi < GRID_MIN_MIDI) midi += 12;
  while (midi > GRID_MAX_MIDI) midi -= 12;

  return Note.fromMidiSharps(midi);
}
