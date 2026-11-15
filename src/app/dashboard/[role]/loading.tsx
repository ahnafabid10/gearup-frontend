export default function DashboardLoading() {
  return (
    <div className="dash-content-wrapper" aria-label="Loading workspace">
      <div className="dash-header-section">
        <div>
          <div
            className="dash-skel-cell"
            style={{ width: "120px", height: "14px", marginBottom: "8px" }}
          />
          <div
            className="dash-skel-cell"
            style={{ width: "260px", height: "30px", marginBottom: "8px" }}
          />
          <div
            className="dash-skel-cell"
            style={{ width: "380px", height: "16px" }}
          />
        </div>
      </div>

      <div className="dash-overview-block">
        <div className="dash-stat-grid-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <article key={i} className="dash-stat-card">
              <div className="dash-stat-card-top">
                <span
                  className="dash-skel-cell"
                  style={{ width: "80px", height: "14px" }}
                />
                <span className="dash-stat-icon-pill" />
              </div>
              <div
                className="dash-stat-skel"
                style={{ width: "64px", height: "26px", margin: "6px 0" }}
              />
              <div
                className="dash-skel-cell"
                style={{ width: "120px", height: "12px" }}
              />
            </article>
          ))}
        </div>

        <div className="dash-chart-card">
          <div className="dash-chart-header">
            <div>
              <div
                className="dash-skel-cell"
                style={{ width: "140px", height: "12px", marginBottom: "6px" }}
              />
              <div
                className="dash-skel-cell"
                style={{ width: "220px", height: "20px" }}
              />
            </div>
            <div
              className="dash-skel-cell"
              style={{ width: "100px", height: "28px" }}
            />
          </div>
          <div
            className="dash-chart-body"
            style={{
              height: "180px",
              display: "flex",
              alignItems: "flex-end",
              gap: "24px",
              padding: "20px",
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="dash-skel-cell"
                style={{
                  flex: 1,
                  height: `${30 + (i % 3) * 35}%`,
                  borderRadius: "4px 4px 0 0",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="dash-table-card">
        <div className="table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>
                  <div
                    className="dash-skel-cell"
                    style={{ width: "60px", height: "14px" }}
                  />
                </th>
                <th>
                  <div
                    className="dash-skel-cell"
                    style={{ width: "90px", height: "14px" }}
                  />
                </th>
                <th>
                  <div
                    className="dash-skel-cell"
                    style={{ width: "80px", height: "14px" }}
                  />
                </th>
                <th>
                  <div
                    className="dash-skel-cell"
                    style={{ width: "70px", height: "14px" }}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skel-${rIdx}`} className="dash-skel-row">
                  <td>
                    <div className="dash-skel-cell" style={{ width: "75%" }} />
                  </td>
                  <td>
                    <div className="dash-skel-cell" style={{ width: "60%" }} />
                  </td>
                  <td>
                    <div className="dash-skel-cell" style={{ width: "50%" }} />
                  </td>
                  <td>
                    <div className="dash-skel-cell" style={{ width: "40%" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
