import { Fragment } from "react";
import { REF_PATTERN, RESOURCE_BY_ID } from "../data/resources";

// Renders page prose that may contain [[resource-id]] references, turning
// each one into a link to that reading, and `code` spans. Plain text passes
// straight through.

/** Plain text with `code` spans rendered as <code>. */
function Plain({ text }: { text: string }) {
  const bits = text.split(/`([^`]+)`/);
  return <>{bits.map((b, i) => (i % 2 === 1 ? <code key={i}>{b}</code> : <Fragment key={i}>{b}</Fragment>))}</>;
}

export default function RichText({ text }: { text: string }) {
  const parts: JSX.Element[] = [];
  const re = new RegExp(REF_PATTERN.source, "g");
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(<Plain key={key++} text={text.slice(last, m.index)} />);
    }
    const r = RESOURCE_BY_ID[m[1]];
    parts.push(
      r ? (
        <a key={key++} href={r.url} target="_blank" rel="noreferrer">
          {r.label}
        </a>
      ) : (
        <Fragment key={key++}>{m[0]}</Fragment>
      ),
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<Plain key={key++} text={text.slice(last)} />);

  return <>{parts}</>;
}
