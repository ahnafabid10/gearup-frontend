"use client";

export function Loading({
  type = "spinner",
  label = "Loading…",
}: {
  type?: "spinner" | "cards" | "table";
  label?: string;
}) {
  if (type === "cards") {
    return (
      <div aria-label="Loading" className="grid cards">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" />
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="dash-table-card" aria-label="Loading records">
        <div className="table-wrap">
          <table className="dash-table">
            <tbody>
              {Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skel-${rIdx}`} className="dash-skel-row">
                  <td>
                    <div className="dash-skel-cell" style={{ width: "70%" }} />
                  </td>
                  <td>
                    <div className="dash-skel-cell" style={{ width: "50%" }} />
                  </td>
                  <td>
                    <div className="dash-skel-cell" style={{ width: "40%" }} />
                  </td>
                  <td>
                    <div className="dash-skel-cell" style={{ width: "30%" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-loading-center" role="status" aria-live="polite">
      <div className="dash-spinner" />
      <span className="dash-loading-text">{label}</span>
    </div>
  );
}
