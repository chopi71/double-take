// Every sound in DOUBLE TAKE is synthesized with WebAudio oscillators — no audio files.
// A soft click for the buttons, a bright two-note ding for a find, a low buzz for a miss and
// a short rising jingle when a scene is completed. The context is created lazily on the
// first user gesture, as browsers require, and the M key (or the Sound button) mutes it all.

export function createSound() {
  let context = null;
  let enabled = true;

  function ensureContext() {
    if (context === null) {
      const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
      if (AudioCtor === undefined) return null;
      context = new AudioCtor();
    }
    if (context.state === 'suspended') void context.resume();
    return context;
  }

  /** One oscillator note: frequency, start offset and length in seconds, a gentle envelope. */
  function tone(frequency, options = {}) {
    if (!enabled) return;
    const ac = ensureContext();
    if (ac === null) return;
    const { type = 'sine', at = 0, dur = 0.15, gain = 0.12, slideTo = null } = options;
    const start = ac.currentTime + at;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(amp);
    amp.connect(ac.destination);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  return {
    /** Whether sound is currently on (the Sound button and the M key flip it). */
    get enabled() {
      return enabled;
    },
    /** Flip the mute and report the new state; unmuting answers with a click so it is heard. */
    toggle() {
      enabled = !enabled;
      if (enabled) tone(660, { dur: 0.06, gain: 0.06 });
      return enabled;
    },
    /** Create/resume the context inside a user gesture, so later notes are allowed to play. */
    unlock() {
      ensureContext();
    },
    /** A soft blip for button presses. */
    click() {
      tone(660, { dur: 0.06, gain: 0.06 });
    },
    /** A find: two bright notes, the second a fifth above the first. */
    ding() {
      tone(880, { dur: 0.12 });
      tone(1318.5, { at: 0.07, dur: 0.22 });
    },
    /** A miss: a low sawtooth sagging downward. */
    buzz() {
      tone(150, { type: 'sawtooth', dur: 0.2, gain: 0.08, slideTo: 110 });
    },
    /** A scene completed: a four-note rise. */
    jingle() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((frequency, index) => tone(frequency, { at: index * 0.11, dur: 0.24, gain: 0.1 }));
    },
  };
}
