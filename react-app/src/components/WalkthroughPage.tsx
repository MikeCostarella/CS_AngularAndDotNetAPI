import { useCallback, useEffect, useState, type CSSProperties } from "react";
import RichText from "./RichText";
import { MODULES } from "../data/modules";
import { WALKTHROUGH_LEDE, WALKTHROUGH_STEPS, type WalkStep } from "../data/walkthrough";

// The Service → UI walkthrough: the API first (Swagger), then one purchase
// through the Angular client. Two views of the same steps: Read (one long
// page, good for students) and Present (one step at a time, arrow keys, for
// lecture).

const imgSrc = (file: string) => `${import.meta.env.BASE_URL}walkthrough/${file}`;

function modHref(n: number) {
  const m = MODULES.find((x) => x.number === n);
  return m ? `#/m/${m.id}` : "#/syllabus";
}

function StepBody({ step, index, big }: { step: WalkStep; index: number; big?: boolean }) {
  return (
    <div className={"wt-step" + (big ? " wt-big" : "")}>
      <figure className="wt-shot">
        <div className="wt-url" aria-label="Address">
          <span className={`wt-layer wt-layer-${step.layer.toLowerCase()}`}>{step.layer}</span>
          <code>{step.url}</code>
        </div>
        <a href={imgSrc(step.image)} target="_blank" rel="noreferrer" title="Open full size">
          <img
            src={imgSrc(step.image)}
            alt={step.alt}
            width={step.size[0]}
            height={step.size[1]}
            style={{ "--ar": step.size[0] / step.size[1] } as CSSProperties}
            loading={index < 2 ? "eager" : "lazy"}
          />
        </a>
        <figcaption>{step.summary}</figcaption>
      </figure>

      <div className="wt-notes">
        <div className="wt-col">
          <h3>HTTP behind this screen</h3>
          <ul className="wt-calls">
            {step.calls.map((c) => (
              <li key={c.method + c.route + c.when}>
                <span className={`http-method http-${c.method.toLowerCase()}`}>{c.method}</span>{" "}
                <code>{c.route}</code>
                <span className="wt-when">{c.when}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="wt-col">
          <h3>Talking points</h3>
          <ul className="topics wt-points">
            {step.points.map((p, i) => (
              <li key={i}>
                <RichText text={p} />
              </li>
            ))}
          </ul>

          {step.ask && (
            <p className="wt-ask">
              <b>Ask the room:</b> <RichText text={step.ask} />
            </p>
          )}

          <p className="wt-mods">
            Studied in{" "}
            {step.modules.map((n, i) => (
              <span key={n}>
                {i > 0 && ", "}
                <a href={modHref(n)}>Module {n}</a>
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WalkthroughPage() {
  const [present, setPresent] = useState(false);
  const [cur, setCur] = useState(0);
  const last = WALKTHROUGH_STEPS.length - 1;

  const go = useCallback((i: number) => setCur(Math.max(0, Math.min(last, i))), [last]);

  useEffect(() => {
    if (!present) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        setCur((c) => Math.min(last, c + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setCur((c) => Math.max(0, c - 1));
      } else if (e.key === "Home") setCur(0);
      else if (e.key === "End") setCur(last);
      else if (e.key === "Escape") setPresent(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [present, last]);

  // Keep the current step at the top of the view while presenting.
  useEffect(() => {
    if (present) document.getElementById("wt-stage")?.scrollIntoView({ block: "start" });
  }, [present, cur]);

  const startAt = (i: number) => {
    go(i);
    setPresent(true);
  };

  return (
    <article className={"page walkthrough" + (present ? " wt-presenting" : "")} id="top">
      <p className="kicker">WeShopAlot · Demo</p>
      <h1>Service → UI walkthrough</h1>
      <p className="lede">{WALKTHROUGH_LEDE}</p>

      <div className="wt-toolbar">
        <div className="wt-mode" role="group" aria-label="View">
          <button type="button" aria-pressed={!present} onClick={() => setPresent(false)}>
            Read
          </button>
          <button type="button" aria-pressed={present} onClick={() => startAt(present ? cur : 0)}>
            Present
          </button>
        </div>
        {present && <span className="wt-hint">← → to move · Esc to leave</span>}
      </div>

      <ol className="wt-flow" aria-label="Steps">
        {WALKTHROUGH_STEPS.map((s, i) => (
          <li key={s.id}>
            {present ? (
              <button
                type="button"
                className={"wt-chip" + (i === cur ? " on" : "") + (s.layer === "Service" ? " svc" : "")}
                aria-current={i === cur ? "step" : undefined}
                onClick={() => go(i)}
              >
                {i}. {s.short}
              </button>
            ) : (
              <a className={"wt-chip" + (s.layer === "Service" ? " svc" : "")} href={`#/walkthrough?s=${s.id}`}>
                {i}. {s.short}
              </a>
            )}
          </li>
        ))}
      </ol>

      {present ? (
        <section id="wt-stage" className="wt-stage">
          <h2>
            <span className="wt-num">
              {cur} / {last}
            </span>{" "}
            {WALKTHROUGH_STEPS[cur].title}
          </h2>
          <StepBody step={WALKTHROUGH_STEPS[cur]} index={cur} big />
          <div className="pager">
            <button type="button" className="wt-nav" disabled={cur === 0} onClick={() => go(cur - 1)}>
              ← {cur > 0 ? WALKTHROUGH_STEPS[cur - 1].short : "Start"}
            </button>
            <button type="button" className="wt-nav" disabled={cur === last} onClick={() => go(cur + 1)}>
              {cur < last ? WALKTHROUGH_STEPS[cur + 1].short : "End"} →
            </button>
          </div>
        </section>
      ) : (
        WALKTHROUGH_STEPS.map((s, i) => (
          <section key={s.id} id={s.id}>
            <h2>
              <span className="wt-num">{i}</span> {s.title}
              <button type="button" className="wt-present-here" onClick={() => startAt(i)}>
                Present from here
              </button>
            </h2>
            <StepBody step={s} index={i} />
          </section>
        ))
      )}

      <p className="wt-foot">
        Every route above is in the <a href="#/reference?s=endpoints">endpoint table</a>, with what it teaches.
        Screenshots: WeShopAlot running locally, October 2026.
      </p>
    </article>
  );
}
