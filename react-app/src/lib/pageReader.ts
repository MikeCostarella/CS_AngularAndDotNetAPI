// Read-aloud engine: turns the page's main content into an ordered list of
// readable blocks, which the player speaks with the browser's built-in voices
// (Web Speech API — free, no keys, works offline with local voices).
//
// Shared across the course sites — keep these files identical in every repo:
//   src/lib/pageReader.ts            page → readable blocks, start events
//   src/lib/voices.ts                voices, listener preferences, utterances
//   src/components/ReadAloud.tsx     the player bar and the "Listen" button
//   src/components/ReadAloudSettings.tsx  the voice settings panel
//   src/styles/readaloud.css         styles for all of the above
//
// Design notes
// - Blocks are found by walking the DOM and using computed display, so new
//   page components are read correctly without registering anything.
// - Text is spoken in short chunks (a sentence or two). Chrome silently cuts
//   off long utterances after ~15 s, and short chunks also make pause/resume
//   reliable: "pause" cancels and "resume" re-speaks the current chunk,
//   because native pause()/resume() is unreliable with Chrome's online voices.
// - Opt an element out of reading with class "tts-skip" or data-tts="skip".

export interface ReadBlock {
  el: HTMLElement;
  chunks: string[];
}

/** Elements never read: code, form controls, pop-ups, page chrome. */
const SKIP = [
  "script",
  "style",
  "template",
  "noscript",
  "svg",
  "pre",
  "textarea",
  "input",
  "select",
  "iframe",
  ".term-tip",
  ".copy-btn",
  ".sr-only",
  ".crumbs",
  ".notes-toc",
  ".pager",
  ".note-nav",
  ".build-stamp",
  "footer",
  ".oc-problems",
  ".tts-skip",
  "[data-tts='skip']",
  "[aria-hidden='true']",
  "[hidden]",
].join(",");

const MAX_CHUNK = 220;

function isInlineDisplay(d: string): boolean {
  return d === "inline" || d === "inline-block" || d === "inline-flex" || d === "inline-grid" || d === "contents";
}

function tidy(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/[↗→←↑↓▾›✓✉]/g, "")
    .replace(/\*\*|`/g, "") // stray Markdown emphasis and code ticks
    .replace(/\s+/g, " ")
    .replace(/([.!?:;])(\s*[.,;])+/g, "$1")
    .trim();
}

/** Speakable symbols: "·" separators become pauses, "&" reads as "and". */
function speakable(s: string): string {
  return s.replace(/\s·\s/g, ", ").replace(/\s&\s/g, " and ").replace(/\s—\s|—/g, ", ");
}

/** Splits text into sentence-sized chunks no longer than MAX_CHUNK. */
export function chunkText(text: string): string[] {
  // Sentence ends are punctuation followed by whitespace, so "0.7" and
  // "v1.2" stay whole.
  const sentences = text.split(/(?<=[.!?]["')\]]?)\s+/);
  const out: string[] = [];
  let cur = "";
  const push = (s: string) => {
    const t = s.trim();
    if (t) out.push(t);
  };
  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    if (s.length > MAX_CHUNK) {
      push(cur);
      cur = "";
      // Break a long sentence at clause boundaries, then at word boundaries.
      let rest = s;
      while (rest.length > MAX_CHUNK) {
        const window = rest.slice(0, MAX_CHUNK);
        let cut = Math.max(window.lastIndexOf(", "), window.lastIndexOf("; "), window.lastIndexOf(": "));
        if (cut < MAX_CHUNK * 0.4) cut = window.lastIndexOf(" ");
        if (cut <= 0) cut = MAX_CHUNK;
        push(rest.slice(0, cut + 1));
        rest = rest.slice(cut + 1);
      }
      cur = rest;
    } else if ((cur + " " + s).length > MAX_CHUNK) {
      push(cur);
      cur = s;
    } else {
      cur = cur ? cur + " " + s : s;
    }
  }
  push(cur);
  return out;
}

/** Walks a root element and returns its readable blocks in document order. */
export function collectBlocks(root: HTMLElement): ReadBlock[] {
  const blocks: ReadBlock[] = [];
  let buf = "";
  let bufEl: HTMLElement | null = null;

  const flush = () => {
    const text = tidy(buf);
    buf = "";
    if (bufEl && /[\p{L}\p{N}]/u.test(text)) {
      blocks.push({ el: bufEl, chunks: chunkText(speakable(text)) });
    }
  };

  const walk = (node: Node, block: HTMLElement) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (bufEl !== block) {
        flush();
        bufEl = block;
      }
      buf += node.textContent ?? "";
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    if (el.matches(SKIP)) return;

    const cs = window.getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return;

    // A closed <details> shows only its summary.
    if (el.tagName === "DETAILS" && !(el as HTMLDetailsElement).open) {
      const summary = el.querySelector(":scope > summary");
      if (summary) walk(summary, block);
      return;
    }

    // Table rows read as one block, cells separated by a pause.
    if (cs.display === "table-cell") {
      for (const c of Array.from(el.childNodes)) walk(c, block);
      if (bufEl === block) buf += ". ";
      return;
    }

    if (isInlineDisplay(cs.display)) {
      // Pills and chips (inline-block) are separate words even with no space in the markup.
      const spaced = cs.display !== "inline" && cs.display !== "contents";
      if (spaced && bufEl === block) buf += " ";
      for (const c of Array.from(el.childNodes)) walk(c, block);
      if (spaced && bufEl === block) buf += " ";
      if (el.tagName === "BR") buf += " ";
      return;
    }

    // Block-level: its text is a block of its own.
    flush();
    bufEl = el;
    for (const c of Array.from(el.childNodes)) walk(c, el);
    flush();
    bufEl = block;
  };

  walk(root, root);
  flush();
  return blocks;
}

/** True when the browser can speak (Web Speech API). */
export const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

// ---------------------------------------------------------------------------
// Events other components use to drive the player.

export const READ_EVENT = "readaloud:start";

export interface ReadStartDetail {
  /** Where to start: "top" of the page, the first block in "view", or an element id. */
  from: "top" | "view" | { id: string };
}

export function startReadAloud(from: ReadStartDetail["from"] = "top"): void {
  window.dispatchEvent(new CustomEvent<ReadStartDetail>(READ_EVENT, { detail: { from } }));
}
