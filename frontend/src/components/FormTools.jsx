export function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

export function Field({ label, name, type = "text", defaultValue = "", ...props }) {
  const input =
    type === "textarea" ? (
      <textarea name={name} defaultValue={defaultValue} {...props} />
    ) : (
      <input name={name} type={type} defaultValue={defaultValue} {...props} />
    );

  return (
    <label className="field">
      <span>{label}</span>
      {input}
    </label>
  );
}

export function SelectField({ label, name, options, defaultValue }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue || options[0]}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Status({ state }) {
  if (!state?.message) return <p className="status" />;
  return <p className={`status ${state.ok ? "ok" : "err"}`}>{state.message}</p>;
}

export function DataTable({ rows, columns }) {
  if (!rows?.length) return <div className="empty">No records loaded yet.</div>;

  const keys = columns || Object.keys(rows[0]).slice(0, 8);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {keys.map((key) => (
              <th key={key}>{key.replaceAll("_", " ")}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || row.project_id || row.scheme_id || row.invoice_id || index}>
              {keys.map((key) => (
                <td key={key}>{formatCell(row[key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
