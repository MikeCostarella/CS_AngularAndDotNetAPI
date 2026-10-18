// Voices and listener preferences for the read-aloud player (shared across
// the course sites — see the file list at the top of pageReader.ts).
//
// Voices come from the browser and operating system, so the list differs by
// device: Edge on Windows offers Microsoft's online "Natural" voices, Chrome
// offers a few Google voices plus the local system ones, Safari the macOS ones.

import { useEffect, useMemo, useState } from "react";
import { ttsSupported } from "./pageReader";

// ---------------------------------------------------------------------------
// Preferences (per viewer, best effort: storage can be blocked or empty)

const PREF_KEY = "readAloud.prefs.v1";

export interface ReadPrefs {
  rate: number;
  pitch: number;
  voiceURI: string | null;
  /** Offer voices in every language, not just English. */
  allLangs: boolean;
}

const DEFAULT_PREFS: ReadPrefs = { rate: 1, pitch: 1, voiceURI: null, allLangs: false };

export function loadPrefs(): ReadPrefs {
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<ReadPrefs>;
      return {
        rate: typeof p.rate === "number" ? p.rate : 1,
        pitch: typeof p.pitch === "number" ? p.pitch : 1,
        voiceURI: p.voiceURI ?? null,
        allLangs: p.allLangs === true,
      };
    }
  } catch {
    /* storage unavailable */
  }
  return { ...DEFAULT_PREFS };
}

export function savePrefs(p: ReadPrefs): void {
  try {
    window.localStorage.setItem(PREF_KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable */
  }
}


/** Voices that sound the most human: Edge/Azure "Natural", neural, and online voices. */
export function isNaturalVoice(v: SpeechSynthesisVoice): boolean {
  return /natural|neural|online|premium|enhanced/i.test(v.name);
}

/** Picker group for a voice, best first. */
export function voiceGroup(v: SpeechSynthesisVoice): string {
  if (isNaturalVoice(v)) return "Natural (most human)";
  if (/^google/i.test(v.name)) return "Google";
  return v.localService ? "On this device" : "Online";
}

export const VOICE_GROUPS = ["Natural (most human)", "Google", "Online", "On this device"];

/**
 * Voices ranked best-sounding first (Edge "Natural", then Google, then the rest),
 * the reader's own language first. English only unless allLangs is set.
 */
export function rankVoices(all: SpeechSynthesisVoice[], allLangs = false): SpeechSynthesisVoice[] {
  const lang = (navigator.language || "en-US").toLowerCase();
  const score = (v: SpeechSynthesisVoice) => {
    let s = 0;
    const vl = v.lang.toLowerCase().replace("_", "-");
    if (vl === lang) s += 40;
    else if (vl.startsWith("en")) s += 30;
    if (isNaturalVoice(v)) s += 12;
    if (/^google/i.test(v.name)) s += 8;
    if (v.default) s += 2;
    return s;
  };
  const en = all.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const list = allLangs || !en.length ? all : en;
  return [...list].sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name));
}

/** A shorter label for the voice picker. */
export function voiceLabel(v: SpeechSynthesisVoice): string {
  const name = v.name
    .replace(/^Microsoft\s+/i, "")
    .replace(/\s+Online\s+\(Natural\)/i, " (Natural)")
    .replace(/\s*-\s*English.*$/i, "");
  return `${name} · ${v.lang}`;
}

// ---------------------------------------------------------------------------
// Voice list

/** The browser's voices, ranked best first. Re-reads when the browser's list changes. */
export function useVoices(allLangs: boolean): SpeechSynthesisVoice[] {
  const [all, setAll] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (!ttsSupported) return;
    const load = () => setAll(window.speechSynthesis.getVoices());
    load();
    // Chrome fills the list asynchronously, and some browsers fire voiceschanged late or never.
    const retry = window.setTimeout(load, 1000);
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.clearTimeout(retry);
      window.speechSynthesis.removeEventListener("voiceschanged", load);
    };
  }, []);
  return useMemo(() => rankVoices(all, allLangs), [all, allLangs]);
}

/** The saved voice if this device has it, else the best-ranked one. */
export function chooseVoice(voices: SpeechSynthesisVoice[], voiceURI: string | null): SpeechSynthesisVoice | null {
  return voices.find((v) => v.voiceURI === voiceURI) ?? voices[0] ?? null;
}

/** An utterance with the listener's voice, speed and pitch applied. */
export function makeUtterance(text: string, voice: SpeechSynthesisVoice | null, prefs: ReadPrefs): SpeechSynthesisUtterance {
  const u = new SpeechSynthesisUtterance(text);
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang;
  }
  u.rate = prefs.rate;
  u.pitch = prefs.pitch;
  return u;
}
