/**
 * Shared browser sound utilities for the hospital website.
 * Uses the Web Audio API — no audio files required.
 */

/** Soft 2-note rising chime for admin notifications (A5 → C#6) */
export function playAdminChime() {
  playTones([880, 1100], "sine", 0.18);
}

/** Warm success sound for public form submission confirmation */
export function playSuccessSound() {
  // A pleasant rising 3-note chord: C5 → E5 → G5
  playTones([523, 659, 784], "sine", 0.12, 0.22);
}

function playTones(
  frequencies: number[],
  type: OscillatorType = "sine",
  volume = 0.15,
  spacing = 0.18
) {
  try {
    const ctx = new AudioContext();
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * spacing;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55);
      osc.start(start);
      osc.stop(start + 0.6);
    });
  } catch {
    // Silently skip if AudioContext is blocked
  }
}
