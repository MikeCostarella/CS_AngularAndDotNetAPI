import { useCallback, useEffect, useRef, useState } from "react";
import {
  READ_EVENT,
  collectBlocks,
  loadPrefs,
  rankVoices,
  savePrefs,
  startReadAloud,
  ttsSupported,
  voiceLabel,
} from "../lib/pageReader";
import type { ReadBlock, ReadPrefs, ReadStartDetail } from "../lib/pageReader";

// Integrated read-aloud player. A "Listen" button floats in the corner; it
// opens a player bar that reads the page's main content paragraph by
// paragraph, highlighting and scrolling to the one being read. While the
// player is open, clicking a paragraph reads from there.

type Status = "idle" | "playing" | "paused";

const RATES = [0.75, 0.9, 1, 1.15, 1.25, 1.5, 1.75, 2];
const ROOT_SELECTOR = "main";
const NOT_A_JUMP = "a, button, input, select, textarea, summary, label, .term, .copy-btn, .ra-bar";

function pathOf(hash: string): string {
  const qi = hash.indexOf("?");
  return qi === -1 ? hash : hash.slice(0, qi);
}

function sectionOf(hash: string): string | null {
  const qi = hash.indexOf("?");
  return qi === -1 ? null : new URLSearchParams(hash.slice(qi + 1)).get("s");
}

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export default function ReadAloud({ hidden = false }: { hidden?: boolean }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [finished, setFinished] = useState(false);
  const [index, setIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const [prefs, setPrefs] = useState<ReadPrefs>(loadPrefs);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const blocksRef = useRef<ReadBlock[] | null>(null);
  const posRef = useRef({ b: 0, c: 0 });
  const genRef = useRef(0);
  const statusRef = useRef<Status>("idle");
  const prefsRef = useRef(prefs);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null); // keeps Chrome from GC-ing it mid-speech
  const timerRef = useRef<number | undefined>(undefined);
  const currentElRef = useRef<HTMLElement | null>(null);
  const pathRef = useRef(pathOf(window.location.hash));

  prefsRef.current = prefs;

  const setStat = (s: Status) => {
    statusRef.current = s;
    setStatus(s);
  };

  // ---- voices ------------------------------------------------------------
  useEffect(() => {
    if (!ttsSupported) return;
    const load = () => {
      const ranked = rankVoices(window.speechSynthesis.getVoices());
      voicesRef.current = ranked;
      setVoices(ranked);
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  const pickVoice = (): SpeechSynthesisVoice | null => {
    const list = voicesRef.current;
    return list.find((v) => v.voiceURI === prefsRef.current.voiceURI) ?? list[0] ?? null;
  };

  // ---- highlighting ------------------------------------------------------
  const clearHighlight = () => {
    currentElRef.current?.removeAttribute("data-tts-current");
    currentElRef.current = null;
  };

  const highlight = (el: HTMLElement) => {
    if (currentElRef.current !== el) {
      clearHighlight();
      el.setAttribute("data-tts-current", "");
      currentElRef.current = el;
    }
    const top = (document.querySelector(".masthead") as HTMLElement | null)?.offsetHeight ?? 0;
    const bar = (document.querySelector(".ra-bar") as HTMLElement | null)?.offsetHeight ?? 0;
    const r = el.getBoundingClientRect();
    if (r.top < top + 8 || r.bottom > window.innerHeight - bar - 16) {
      el.scrollIntoView({ block: r.height > window.innerHeight * 0.6 ? "start" : "center", behavior: reducedMotion() ? "auto" : "smooth" });
    }
  };

  // ---- blocks ------------------------------------------------------------
  const unmarkBlocks = () => {
    blocksRef.current?.forEach((b) => b.el.removeAttribute("data-tts-block"));
  };

  const build = (): ReadBlock[] => {
    unmarkBlocks();
    const root = document.querySelector(ROOT_SELECTOR) as HTMLElement | null;
    const blocks = root ? collectBlocks(root) : [];
    blocks.forEach((b) => b.el.setAttribute("data-tts-block", ""));
    blocksRef.current = blocks;
    setTotal(blocks.length);
    return blocks;
  };

  const blocks = () => blocksRef.current ?? build();

  // ---- speaking ----------------------------------------------------------
  const finish = () => {
    genRef.current++;
    window.clearTimeout(timerRef.current);
    window.speechSynthesis.cancel();
    clearHighlight();
    posRef.current = { b: 0, c: 0 };
    setIndex(0);
    setStat("idle");
    setFinished(true);
  };

  const speakFrom = (b: number, c: number) => {
    const list = blocks();
    const gen = ++genRef.current;
    window.clearTimeout(timerRef.current);
    window.speechSynthesis.cancel();
    if (b >= list.length) {
      finish();
      return;
    }
    posRef.current = { b, c };
    setIndex(b);
    setFinished(false);
    setStat("playing");
    const block = list[b];
    if (!block.el.isConnected) {
      // The page changed under us; rebuild and carry on from the same spot.
      const fresh = build();
      if (!fresh.length) finish();
      else speakFrom(Math.min(b, fresh.length - 1), 0);
      return;
    }
    highlight(block.el);

    // A short gap after cancel(): Chrome can drop a speak() issued in the same tick.
    timerRef.current = window.setTimeout(() => {
      if (gen !== genRef.current) return;
      const u = new SpeechSynthesisUtterance(block.chunks[c] ?? "");
      const voice = pickVoice();
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      }
      u.rate = prefsRef.current.rate;
      const advance = () => {
        if (gen !== genRef.current) return;
        if (c + 1 < block.chunks.length) speakFrom(b, c + 1);
        else speakFrom(b + 1, 0);
      };
      u.onend = advance;
      u.onerror = (e) => {
        if (e.error === "interrupted" || e.error === "canceled") return;
        advance();
      };
      uttRef.current = u;
      window.speechSynthesis.speak(u);
    }, 50);
  };

  const startAt = (from: ReadStartDetail["from"]) => {
    const list = build();
    if (!list.length) return;
    let start = 0;
    if (from === "view") {
      const top = (document.querySelector(".masthead") as HTMLElement | null)?.offsetHeight ?? 0;
      const i = list.findIndex((bl) => bl.el.getBoundingClientRect().bottom > top + 12);
      start = i === -1 ? 0 : i;
    } else if (typeof from === "object") {
      const target = document.getElementById(from.id);
      if (target) {
        const i = list.findIndex(
          (bl) => target.contains(bl.el) || !!(target.compareDocumentPosition(bl.el) & Node.DOCUMENT_POSITION_FOLLOWING),
        );
        if (i !== -1) start = i;
      }
    }
    setOpen(true);
    speakFrom(start, 0);
  };

  const pause = () => {
    genRef.current++;
    window.clearTimeout(timerRef.current);
    window.speechSynthesis.cancel();
    setStat("paused");
  };

  const resume = () => speakFrom(posRef.current.b, posRef.current.c);

  const stop = useCallback(() => {
    genRef.current++;
    window.clearTimeout(timerRef.current);
    if (ttsSupported) window.speechSynthesis.cancel();
    clearHighlight();
    posRef.current = { b: 0, c: 0 };
    setIndex(0);
    setStat("idle");
    setFinished(false);
  }, []);

  const close = () => {
    stop();
    unmarkBlocks();
    blocksRef.current = null;
    setShowSettings(false);
    setOpen(false);
  };

  const onPlayPause = () => {
    if (statusRef.current === "playing") pause();
    else if (statusRef.current === "paused") resume();
    else if (blocksRef.current && !finished && posRef.current.b > 0) resume();
    else startAt(window.scrollY < 150 ? "top" : "view");
  };

  const step = (delta: number) => {
    const list = blocks();
    if (!list.length) return;
    const b = Math.max(0, Math.min(list.length - 1, posRef.current.b + delta));
    if (statusRef.current === "playing") {
      speakFrom(b, 0);
    } else {
      posRef.current = { b, c: 0 };
      setIndex(b);
      highlight(list[b].el);
      if (statusRef.current === "idle") setStat("paused");
    }
  };

  const updatePrefs = (p: Partial<ReadPrefs>) => {
    const next = { ...prefsRef.current, ...p };
    prefsRef.current = next;
    setPrefs(next);
    savePrefs(next);
    // Apply right away: re-speak the current chunk with the new setting.
    if (statusRef.current === "playing") speakFrom(posRef.current.b, posRef.current.c);
  };

  // ---- wiring ------------------------------------------------------------
  // Latest-callback refs so the window listeners below are registered once.
  const startRef = useRef(startAt);
  startRef.current = startAt;
  const speakRef = useRef(speakFrom);
  speakRef.current = speakFrom;

  useEffect(() => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel(); // a reload can leave the previous page talking

    const onStart = (e: Event) => startRef.current((e as CustomEvent<ReadStartDetail>).detail?.from ?? "top");

    const onHash = () => {
      const path = pathOf(window.location.hash);
      const samePage = path === pathRef.current;
      pathRef.current = path;
      const section = sectionOf(window.location.hash);
      if (samePage && section && statusRef.current === "playing") {
        // An in-page link (e.g. the notes' topic list): follow it and keep reading.
        window.setTimeout(() => startRef.current({ id: section }), 60);
        return;
      }
      if (!samePage) {
        stop();
        blocksRef.current?.forEach((b) => b.el.removeAttribute("data-tts-block"));
        blocksRef.current = null;
        setTotal(0);
      }
    };

    // Opening or closing a "Check yourself" answer changes what there is to read.
    const onToggle = (e: Event) => {
      if (!blocksRef.current) return;
      const root = document.querySelector(ROOT_SELECTOR);
      if (!root || !root.contains(e.target as Node)) return;
      const cur = blocksRef.current[posRef.current.b]?.el;
      const fresh = build();
      const i = cur ? fresh.findIndex((b) => b.el === cur) : -1;
      if (i !== -1) {
        posRef.current = { b: i, c: posRef.current.c };
        setIndex(i);
      }
    };

    const onClick = (e: MouseEvent) => {
      if (!blocksRef.current || e.button !== 0) return;
      const target = e.target as HTMLElement;
      const root = document.querySelector(ROOT_SELECTOR);
      if (!root || !root.contains(target) || target.closest(NOT_A_JUMP)) return;
      if (window.getSelection()?.toString()) return; // selecting text, not jumping
      for (let n: HTMLElement | null = target; n && n !== root; n = n.parentElement) {
        const i = blocksRef.current.findIndex((b) => b.el === n);
        if (i !== -1) {
          speakRef.current(i, 0);
          return;
        }
      }
    };

    const onLeave = () => window.speechSynthesis.cancel();

    window.addEventListener(READ_EVENT, onStart);
    window.addEventListener("hashchange", onHash);
    document.addEventListener("toggle", onToggle, true);
    document.addEventListener("click", onClick);
    window.addEventListener("pagehide", onLeave);
    return () => {
      window.removeEventListener(READ_EVENT, onStart);
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("toggle", onToggle, true);
      document.removeEventListener("click", onClick);
      window.removeEventListener("pagehide", onLeave);
      window.speechSynthesis.cancel();
    };
  }, [stop]);

  // Room at the bottom of the page so the bar never hides the last paragraph.
  useEffect(() => {
    document.body.classList.toggle("tts-open", open);
    return () => document.body.classList.remove("tts-open");
  }, [open]);

  // Pages with their own reader (slide decks) hide the player.
  useEffect(() => {
    if (hidden) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden]);

  if (!ttsSupported || hidden) return null;

  if (!open) {
    return (
      <button
        type="button"
        className="ra-fab"
        onClick={() => startAt(window.scrollY < 150 ? "top" : "view")}
        title="Read this page aloud"
      >
        <span aria-hidden="true">🔊</span> Listen
      </button>
    );
  }

  const where = total ? `${Math.min(index + 1, total)} of ${total}` : "";
  const word = status === "playing" ? "Reading" : status === "paused" ? "Paused ·" : finished ? "Finished" : "Ready";
  const showWhere = status !== "idle" && !!where;
  const currentVoice = pickVoice();

  return (
    <div className="ra-bar" role="region" aria-label="Read aloud">
      <div className="ra-row">
        <button type="button" className="ra-btn" onClick={() => step(-1)} aria-label="Previous paragraph" title="Previous paragraph">
          ⏮
        </button>
        <button
          type="button"
          className="ra-btn ra-play"
          onClick={onPlayPause}
          aria-label={status === "playing" ? "Pause" : "Play"}
          title={status === "playing" ? "Pause" : "Play"}
        >
          {status === "playing" ? "⏸" : "▶"}
        </button>
        <button type="button" className="ra-btn" onClick={() => step(1)} aria-label="Next paragraph" title="Next paragraph">
          ⏭
        </button>
        <button type="button" className="ra-btn" onClick={stop} aria-label="Stop" title="Stop">
          ⏹
        </button>
        <span className="ra-status" title="Click any paragraph on the page to read from there">
          <span className={showWhere ? "ra-word" : undefined}>{word}</span>
          {showWhere && ` ${where}`}
        </span>
        <select
          className="ra-rate"
          value={prefs.rate}
          onChange={(e) => updatePrefs({ rate: Number(e.target.value) })}
          aria-label="Reading speed"
          title="Reading speed"
        >
          {RATES.map((r) => (
            <option key={r} value={r}>
              {r}×
            </option>
          ))}
        </select>
        <button
          type="button"
          className={"ra-btn ra-gear" + (showSettings ? " on" : "")}
          onClick={() => setShowSettings((v) => !v)}
          aria-expanded={showSettings}
          aria-label="Voice settings"
          title="Voice settings"
        >
          ⚙
        </button>
        <button type="button" className="ra-btn ra-close" onClick={close} aria-label="Close read aloud" title="Close">
          ✕
        </button>
      </div>
      {showSettings && (
        <div className="ra-settings">
          <label>
            Voice
            <select
              value={currentVoice?.voiceURI ?? ""}
              onChange={(e) => updatePrefs({ voiceURI: e.target.value })}
            >
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {voiceLabel(v)}
                </option>
              ))}
            </select>
          </label>
          <p className="ra-hint">
            Click any paragraph to read from there. Voices come from your browser and operating system — Edge's
            "Natural" voices sound the most human.
          </p>
        </div>
      )}
    </div>
  );
}

/** "Listen" button for page headers: reads the page from the top. */
export function ListenButton({ label = "Listen to this page" }: { label?: string }) {
  if (!ttsSupported) return null;
  return (
    <button
      type="button"
      className="listen-btn tts-skip"
      onClick={() => startReadAloud("top")}
    >
      <span aria-hidden="true">🔊</span> {label}
    </button>
  );
}
