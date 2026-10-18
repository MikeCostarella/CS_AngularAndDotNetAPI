import { VOICE_GROUPS, voiceGroup, voiceLabel } from "../lib/voices";
import type { ReadPrefs } from "../lib/voices";

// Voice settings panel for the read-aloud player, opened with its ⚙ button
// (shared across the course sites — see the file list at the top of
// lib/pageReader.ts). Settings apply immediately and are remembered per browser.

const PREVIEW_TEXT = "Hi! This is how I will sound reading the course notes.";

interface Props {
  /** Voices ranked best first (from useVoices). */
  voices: SpeechSynthesisVoice[];
  /** The voice in use: the saved one if this device has it, else the best-ranked. */
  currentVoice: SpeechSynthesisVoice | null;
  prefs: ReadPrefs;
  onChange: (p: Partial<ReadPrefs>) => void;
  /** Speak a sample sentence with the current settings. */
  onPreview: (text: string) => void;
}

export default function ReadAloudSettings({ voices, currentVoice, prefs, onChange, onPreview }: Props) {
  const hasNatural = voices.some((v) => voiceGroup(v) === VOICE_GROUPS[0]);
  const count = `${voices.length} voice${voices.length === 1 ? "" : "s"} available.`;
  const hint = !voices.length
    ? "Your browser hasn't offered any voices yet."
    : hasNatural
      ? `${count} Voices come from your browser and operating system, so the list differs by device.`
      : `${count} For more natural-sounding voices, open this page in Microsoft Edge.`;

  return (
    <div className="ra-settings">
      <div className="ra-field">
        <label htmlFor="ra-voice">Voice</label>
        <select id="ra-voice" value={currentVoice?.voiceURI ?? ""} onChange={(e) => onChange({ voiceURI: e.target.value })}>
          {VOICE_GROUPS.map((g) => {
            const inGroup = voices.filter((v) => voiceGroup(v) === g);
            if (!inGroup.length) return null;
            return (
              <optgroup key={g} label={`${g} (${inGroup.length})`}>
                {inGroup.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {voiceLabel(v)}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
        <button
          type="button"
          className="ra-preview"
          onClick={() => onPreview(PREVIEW_TEXT)}
          disabled={!voices.length}
          title="Hear a sample sentence"
        >
          ▶ Preview
        </button>
      </div>
      <div className="ra-field">
        <label htmlFor="ra-pitch">Pitch</label>
        <input
          id="ra-pitch"
          type="range"
          min={0.5}
          max={1.5}
          step={0.1}
          value={prefs.pitch}
          onChange={(e) => onChange({ pitch: Number(e.target.value) })}
        />
        <button
          type="button"
          className="ra-preview"
          onClick={() => onChange({ pitch: 1 })}
          disabled={prefs.pitch === 1}
          title="Normal pitch"
        >
          Reset
        </button>
      </div>
      <label className="ra-check">
        <input type="checkbox" checked={prefs.allLangs} onChange={(e) => onChange({ allLangs: e.target.checked })} />
        Show voices in all languages
      </label>
      <p className="ra-hint">Click any paragraph to read from there. {hint}</p>
    </div>
  );
}
