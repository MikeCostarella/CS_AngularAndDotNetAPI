import RichText from "./RichText";
import { ENDPOINTS, ENDPOINTS_SECTION, REFERENCE_LEDE, REFERENCE_SECTIONS } from "../data/reference";
import { MODULES } from "../data/modules";

// The WeShopAlot page: the course's reference system, mapped.

export default function ReferencePage() {
  const modHref = (n: number) => {
    const m = MODULES.find((x) => x.number === n);
    return m ? `#/m/${m.id}` : "#/syllabus";
  };

  return (
    <article className="page">
      <h1>Reference app: WeShopAlot</h1>
      <p className="lede">{REFERENCE_LEDE}</p>

      {REFERENCE_SECTIONS.map((s) => (
        <section key={s.id} id={s.id}>
          <h2>{s.heading}</h2>

          {s.paras?.map((p, i) => (
            <p key={i}>
              <RichText text={p} />
            </p>
          ))}

          {s.items && (
            <ul className="topics">
              {s.items.map((it, i) => (
                <li key={i}>
                  <RichText text={it} />
                </li>
              ))}
            </ul>
          )}

          {s.id === ENDPOINTS_SECTION && (
            <div className="table-scroll">
              <table className="schedule-table endpoint-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Route</th>
                    <th>Auth</th>
                    <th>Does</th>
                    <th>Teaches</th>
                    <th>Module</th>
                  </tr>
                </thead>
                <tbody>
                  {ENDPOINTS.map((e) => (
                    <tr key={e.method + e.route}>
                      <td>
                        <span className={`http-method http-${e.method.toLowerCase()}`}>{e.method}</span>
                      </td>
                      <td>
                        <code>{e.route}</code>
                      </td>
                      <td>{e.auth}</td>
                      <td>{e.does}</td>
                      <td>{e.note}</td>
                      <td>
                        <a href={modHref(e.module)}>{e.module}</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </article>
  );
}
