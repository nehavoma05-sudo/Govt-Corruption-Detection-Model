import { useEffect, useMemo, useState } from "react";
import { Upload, Search, Plus, FileCheck, ClipboardCheck, Landmark } from "lucide-react";
import { clearSession, getStoredSession, normalizeNumbers, request, saveSession } from "./lib/api";
import { Field, SelectField, Status, DataTable, formValues } from "./components/FormTools";
import { Sidebar, Topbar } from "./components/Layout";

export default function App() {
  const stored = useMemo(getStoredSession, []);
  const [apiBase, setApiBase] = useState(stored.apiBase);
  const [token, setToken] = useState(stored.token);
  const [user, setUser] = useState(stored.user);
  const [view, setView] = useState("overview");
  const [loginMode, setLoginMode] = useState("citizen");
  const [data, setData] = useState({ projects: [], schemes: [], invoices: [], eligibleSchemes: [] });

  const api = (path, options = {}) => request(path, { apiBase, token, ...options });

async function loadInitial() {
  if (!user) return;

  try {
    if (user.role === "GOV_AGENT") {
      const [projects, schemes] = await Promise.all([
        api("/govt_agent/project/get_all"),
        api("/govt_agent/scheme/get_all")
      ]);

      setData((current) => ({
        ...current,
        projects,
        schemes
      }));
    }

    if (user.role === "INSPECTION_OFFICER") {
      console.log("Loading inspection officer invoices...");

      const invoices = await api("/inspection-officer/get_invoices");

      console.log("Invoices received:", invoices);
      console.log("Invoice count:", invoices?.length);

      setData((current) => ({
        ...current,
        invoices: Array.isArray(invoices) ? invoices : []
      }));
    }

    if (user.role === "CITIZEN") {
      const eligibleSchemes = await api("/user/eligible_schemes");

      setData((current) => ({
        ...current,
        eligibleSchemes
      }));
    }
  } catch (error) {
    console.error("LOAD INITIAL ERROR:", error);
  }
}

useEffect(() => {
  if (user && token) {
    loadInitial();
  }
}, [user?.role, token]);

  function logout() {
    clearSession();
    setToken("");
    setUser(null);
    setView("overview");
  }

  return (
    <div className="app">
      <Topbar user={user} view={view} setView={setView} onLogout={logout} />
      <main className="shell">
        {!user ? (
          <Guest
            apiBase={apiBase}
            setApiBase={setApiBase}
            loginMode={loginMode}
            setLoginMode={setLoginMode}
            api={api}
            onLogin={(auth) => {
              const session = saveSession(auth);
              setToken(session.token);
              setUser(session.user);
            }}
          />
        ) : (
          <section className="dashboard">
            <Sidebar apiBase={apiBase} role={user.role} onRefresh={loadInitial} />
            <div className="grid">
              {view === "overview" && <Overview role={user.role} data={data} />}
              {view === "projects" && <Projects api={api} data={data} setData={setData} />}
              {view === "schemes" && <Schemes api={api} data={data} setData={setData} />}
              {view === "people" && <People api={api} />}
              {view === "reports" && <Reports api={api} user={user} />}
              {view === "citizen" && <Citizen api={api} data={data} setData={setData} />}
              {view === "contractor" && <Contractor api={api} />}
              {view === "inspection" && <Inspection api={api} data={data} setData={setData} />}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Guest({ apiBase, setApiBase, loginMode, setLoginMode, api, onLogin }) {
  return (
    <section className="hero">
      <div className="hero-main">
        <p className="eyebrow">Public fund assurance</p>
        <h1>Government Fraud Detection System</h1>
        <p>A role-aware interface for citizens, government agents, contractors, and inspection officers.</p>
        <div className="metric-row">
          <Metric value="4" label="Role dashboards" />
          <Metric value="12+" label="API actions" />
          <Metric value="JWT" label="Secure sessions" />
        </div>
      </div>
      <section className="login-panel">
        <div className="tabs">
          {["citizen", "gov", "contractor", "officer"].map((mode) => (
            <button key={mode} className={loginMode === mode ? "active" : ""} onClick={() => setLoginMode(mode)}>
              {mode === "gov" ? "Gov" : mode[0].toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
        
        {loginMode === "citizen" ? <CitizenAuth api={api} onLogin={onLogin} /> : <RoleLogin mode={loginMode} api={api} onLogin={onLogin} />}
      </section>
    </section>
  );
}

function CitizenAuth({ api, onLogin }) {
  const [loginStatus, setLoginStatus] = useState(null);
  const [registerStatus, setRegisterStatus] = useState(null);

  async function login(event) {
    event.preventDefault();
    try {
      onLogin(await api("/auth/login", { method: "POST", body: JSON.stringify(formValues(event.currentTarget)) }));
    } catch (error) {
      setLoginStatus({ ok: false, message: error.message });
    }
  }

  async function register(event) {
    event.preventDefault();
    try {
      await api("/auth/register", { method: "POST", body: JSON.stringify(normalizeNumbers(formValues(event.currentTarget), ["age"])) });
      event.currentTarget.reset();
      setRegisterStatus({ ok: true, message: "Registration successful. You can sign in now." });
    } catch (error) {
      setRegisterStatus({ ok: false, message: error.message });
    }
  }

  return (
    <div className="grid">
      <form onSubmit={login}>
        <h3>Citizen login</h3>
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
        <button className="primary-btn full">Sign in</button>
        <Status state={loginStatus} />
      </form>
      <form onSubmit={register}>
        <h3>New citizen registration</h3>
        <Field label="Full name" name="full_name" required />
        <Field label="Age" name="age" type="number" required />
        <Field label="Caste" name="caste" required />
        <Field label="State" name="state" required />
        <Field label="District" name="district" required />
        <Field label="Aadhaar number" name="aadhaar_number" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
        <button className="blue-btn full">Create account</button>
        <Status state={registerStatus} />
      </form>
    </div>
  );
}

function RoleLogin({ mode, api, onLogin }) {
  const [status, setStatus] = useState(null);
  const path = mode === "gov" ? "/auth/gov-agent-login" : mode === "contractor" ? "/auth/contractor-login" : "/auth/inspection-officer-login";

  async function submit(event) {
    event.preventDefault();
    try {
      onLogin(await api(path, { method: "POST", body: JSON.stringify(formValues(event.currentTarget)) }));
    } catch (error) {
      setStatus({ ok: false, message: error.message });
    }
  }

  return (
    <form onSubmit={submit}>
      {mode === "gov" ? (
        <Field label="Government agent password" name="password" type="password" required />
      ) : (
        <>
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required />
        </>
      )}
      <button className="primary-btn full">Sign in</button>
      <Status state={status} />
    </form>
  );
}

function Overview({ role, data }) {
  return (
    <>
      <div className="statline">
        <Stat label="Projects" value={data.projects.length} />
        <Stat label="Schemes" value={data.schemes.length} />
        <Stat label="Invoices" value={data.invoices.length} />
        <Stat label={role === "CITIZEN" ? "Eligible" : "Session"} value={role === "CITIZEN" ? data.eligibleSchemes.length : "Live"} />
      </div>
      <section className="panel">
        <h2>Welcome back</h2>
        <p className="muted">Choose a workspace tab to create records, upload scheme data, or review fraud signals.</p>
        {role === "GOV_AGENT" && <DataTable rows={data.projects} columns={["project_id", "project_name", "department", "district", "budget", "action_state", "fraud_score"]} />}
      </section>
    </>
  );
}

function Projects({ api, data, setData }) {
  const [status, setStatus] = useState(null);
  const [fraud, setFraud] = useState("");

  async function create(event) {
    event.preventDefault();
    try {
      await api("/govt_agent/project/create", {
        method: "POST",
        body: JSON.stringify(normalizeNumbers(formValues(event.currentTarget), ["budget", "approved_work_quantity", "expected_completion_days", "contractor_id", "officer_id"])),
      });
      const projects = await api("/govt_agent/project/get_all");
      event.currentTarget.reset();
      setStatus({ ok: true, message: "Project created successfully." });
      setData((current) => ({ ...current, projects }));
    } catch (error) {
      setStatus({ ok: false, message: error.message });
    }
  }

async function checkFraud(event) {
  event.preventDefault();
  try {
    const { project_id } = formValues(event.currentTarget);
    const result = await api(`/govt_agent/project/${project_id}/get_fraud`);
    setFraud(result); // Store as an object, not a formatted string
  } catch (error) {
    setFraud(error.message);
  }
}

  return (
    <>
      <form className="panel" onSubmit={create}>
        <h2><Plus size={20} /> Create project</h2>
        <div className="grid two">
          <Field label="Project name" name="project_name" required />
          <Field label="Project type" name="project_type" defaultValue="Road" required />
          <Field label="Department" name="department" defaultValue="Public Works" required />
          <Field label="State" name="state_name" required />
          <Field label="District" name="district" required />
          <Field label="Budget" name="budget" type="number" step="0.01" required />
          <Field label="Approved work quantity" name="approved_work_quantity" type="number" step="0.01" required />
          <Field label="Expected completion days" name="expected_completion_days" type="number" required />
          <Field label="Contractor ID" name="contractor_id" type="number" />
          <Field label="Officer ID" name="officer_id" type="number" />
        </div>
        <SelectField label="Action state" name="action_state" options={["CREATED", "ASSIGNED", "IN_PROGRESS", "COMPLETED"]} />
        <button className="primary-btn">Create project</button>
        <Status state={status} />
      </form>
      <form className="panel" onSubmit={checkFraud}>
        <h2><Search size={20} /> Project fraud check</h2>
        <Field label="Project ID" name="project_id" type="number" required />
        <button className="blue-btn">Run check</button>
   {fraud && (
  <div className="status ok">
    {typeof fraud === 'string' ? (
      /* Displays error messages cleanly if the API call fails */
      <p>{fraud}</p>
    ) : (
      /* Formatted UI for fraud data */
      <div style={{ padding: '8px 0' }}>
        <p><strong>Fraud Score:</strong> {fraud.fraud_score}</p>
        <p><strong>Risk Level:</strong> {fraud.risk_level}</p>
        
        {fraud.reasons && fraud.reasons.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <strong>Reasons:</strong>
            <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
              {fraud.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}
  </div>
)}
      </form>
      <section className="panel">
        <h2>All projects</h2>
        <DataTable rows={data.projects} columns={["project_id", "project_name", "department", "district", "budget", "action_state", "fraud_score"]} />
      </section>
    </>
  );
}

function Schemes({ api, data, setData }) {
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState("");

  async function addScheme(event) {
    event.preventDefault();
    try {
      await api("/govt_agent/scheme/add", {
        method: "POST",
        body: JSON.stringify(normalizeNumbers(formValues(event.currentTarget), ["min_age", "max_age", "money_per_person", "budget_crores"])),
      });
      const schemes = await api("/govt_agent/scheme/get_all");
      event.currentTarget.reset();
      setStatus({ ok: true, message: "Scheme added successfully." });
      setData((current) => ({ ...current, schemes }));
    } catch (error) {
      setStatus({ ok: false, message: error.message });
    }
  }

  async function analyze(event, district = false) {
    event.preventDefault();
    try {
      const payload = formValues(event.currentTarget);
      const path = district ? "/govt_agent/scheme/district_fraud" : "/govt_agent/scheme/get_fraud";
      setResult(JSON.stringify(await api(`${path}?scheme_id=${payload.scheme_id}&month=${payload.month}`), null, 2));
    } catch (error) {
      setResult(error.message);
    }
  }

  return (
    <>
      <form className="panel" onSubmit={addScheme}>
        <h2><Landmark size={20} /> Add scheme</h2>
        <div className="grid two">
          <Field label="Scheme name" name="scheme_name" required />
          <Field label="Minimum age" name="min_age" type="number" defaultValue="18" required />
          <Field label="Maximum age" name="max_age" type="number" />
          <Field label="Caste" name="caste" defaultValue="all" required />
          <Field label="Money per person" name="money_per_person" type="number" required />
          <Field label="Budget crores" name="budget_crores" type="number" step="0.01" required />
          <Field label="State" name="state" defaultValue="all" />
          <Field label="District" name="district" defaultValue="all" />
        </div>
        <button className="primary-btn">Add scheme</button>
        <Status state={status} />
      </form>
      <form className="panel" onSubmit={(event) => analyze(event, false)}>
        <h2><Search size={20} /> Scheme fraud analysis</h2>
        <div className="grid two">
          <Field label="Scheme ID" name="scheme_id" type="number" required />
          <Field label="Month" name="month" type="date" required />
        </div>
        <div className="split-actions">
          <button className="primary-btn">Overall fraud</button>
          <button className="blue-btn" type="button" onClick={(event) => analyze(event.currentTarget.form, true)}>
            District fraud
          </button>
        </div>
        <pre className="status ok">{result}</pre>
      </form>
      <UploadBox title="Upload official report" endpoint="/govt_agent/scheme/upload_report" api={api} />
      <UploadBox title="Upload payment records CSV" endpoint="/govt_agent/scheme/upload_records" api={api} />
      <section className="panel">
        <h2>Schemes</h2>
        <DataTable rows={data.schemes} columns={["scheme_id", "scheme_name", "caste", "state", "district", "money_per_person", "budget_crores"]} />
      </section>
    </>
  );
}

function UploadBox({ title, endpoint, api }) {
  const [status, setStatus] = useState(null);

  async function submit(event) {
    event.preventDefault();
    try {
      const body = new FormData();
      body.append("file", event.currentTarget.file.files[0]);
      await api(endpoint, { method: "POST", body });
      event.currentTarget.reset();
      setStatus({ ok: true, message: "Upload complete." });
    } catch (error) {
      setStatus({ ok: false, message: error.message });
    }
  }

  return (
    <form className="panel" onSubmit={submit}>
      <h2><Upload size={20} /> {title}</h2>
      <Field label="File" name="file" type="file" required />
      <button className="blue-btn">Upload</button>
      <Status state={status} />
    </form>
  );
}

function People({ api }) {
  return (
    <div className="grid two">
      <SimplePostForm
        title="Register contractor"
        endpoint="/govt_agent/contractor/create"
        api={api}
        numeric={["previous_projects", "avg_delay_days", "avg_budget_overrun", "fraud_rate", "blacklist_flag"]}
        fields={[
          ["Contractor name", "contractor_name"],
          ["Email", "email", "email"],
          ["Password", "password", "password"],
          ["Previous projects", "previous_projects", "number", "0"],
          ["Average delay days", "avg_delay_days", "number", "0"],
          ["Average budget overrun", "avg_budget_overrun", "number", "0"],
          ["Fraud rate", "fraud_rate", "number", "0"],
          ["Blacklist flag", "blacklist_flag", "number", "0"],
        ]}
      />
      <SimplePostForm
        title="Register inspection officer"
        endpoint="/govt_agent/inspection_officer/create"
        api={api}
        fields={[
          ["Officer name", "officer_name"],
          ["Email", "email", "email"],
          ["Password", "password", "password"],
        ]}
      />
    </div>
  );
}

function Reports({ api, user }) {
  return (
    <SimplePostForm
      title="Submit project report"
      endpoint="/govt_agent/project/submit_report"
      api={api}
      numeric={["project_id", "amount_claimed", "amount_released", "work_completion_percent", "claimed_work_quantity", "actual_days_since_start"]}
      fields={[
        ["Project ID", "project_id", "number"],
        ["Amount claimed", "amount_claimed", "number"],
        ["Amount released", "amount_released", "number"],
        ["Work completion percent", "work_completion_percent", "number"],
        ["Claimed work quantity", "claimed_work_quantity", "number"],
        ["Actual days since start", "actual_days_since_start", "number"],
        ["Submitted by", "submitted_by", "text", user.full_name],
        ["Submission date", "submission_date", "date", new Date().toISOString().slice(0, 10)],
      ]}
    />
  );
}

function Citizen({ api, data, setData }) {
  const [status, setStatus] = useState(null);

  async function findProjects(event) {
    event.preventDefault();
    try {
      const values = formValues(event.currentTarget);
      const projects = await api(`/user/user_projects?state=${encodeURIComponent(values.state)}&district=${encodeURIComponent(values.district)}`);
      setData((current) => ({ ...current, projects }));
    } catch (error) {
      setStatus({ ok: false, message: error.message });
    }
  }

  return (
    <>
      <form className="panel" onSubmit={findProjects}>
        <h2><Search size={20} /> Find local projects</h2>
        <div className="grid two">
          <Field label="State" name="state" required />
          <Field label="District" name="district" required />
        </div>
        <button className="primary-btn">Search projects</button>
        <Status state={status} />
      </form>
      <SimplePostForm
        title="Submit complaint"
        endpoint="/user/complaints"
        api={api}
        numeric={["project_id"]}
        fields={[
          ["Project ID", "project_id", "number"],
          ["Complaint text", "complaint_text", "textarea"],
          ["Complaint date", "complaint_date", "date", new Date().toISOString().slice(0, 10)],
          ["Status", "status", "text", "OPEN"],
        ]}
      />
      <section className="panel">
        <h2>Eligible schemes</h2>
        <DataTable rows={data.eligibleSchemes} />
      </section>
      <section className="panel">
        <h2>Local projects</h2>
        <DataTable rows={data.projects} />
      </section>
    </>
  );
}

function Contractor({ api }) {
  return (
    <SimplePostForm
      title="Submit invoice"
      endpoint="/contractor/add_invoices"
      api={api}
      numeric={["project_id", "vendor_id", "invoice_amount", "work_quantity_claimed"]}
      fields={[
        ["Project ID", "project_id", "number"],
        ["Vendor ID", "vendor_id", "number"],
        ["Invoice amount", "invoice_amount", "number"],
        ["Invoice date", "invoice_date", "date", new Date().toISOString().slice(0, 10)],
        ["Work quantity claimed", "work_quantity_claimed", "number"],
        ["Status", "status", "text", "PENDING"],
      ]}
    />
  );
}

function Inspection({ api, data, setData }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadInvoices() {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching assigned invoices...");

      const invoices = await api("/inspection-officer/get_invoices");

      console.log("Received invoices:", invoices);

      setData((current) => ({
        ...current,
        invoices: Array.isArray(invoices) ? invoices : [],
      }));
    } catch (err) {
      console.error("Invoice loading error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <>
      <SimplePostForm
        title="Add inspection"
        endpoint="/inspection-officer/add_inspections"
        api={api}
        numeric={[
          "project_id",
          "verified_work_quantity",
          "geo_tagged_proof_submitted",
          "proof_document_count"
        ]}
        fields={[
          ["Project ID", "project_id", "number"],
          [
            "Inspection date",
            "inspection_date",
            "date",
            new Date().toISOString().slice(0, 10)
          ],
          ["Verified work quantity", "verified_work_quantity", "number"],
          ["Inspection status", "inspection_status", "text", "PENDING"],
          ["Geo-tagged proof", "geo_tagged_proof_submitted", "number", "0"],
          ["Proof document count", "proof_document_count", "number", "0"],
        ]}
      />

      <section className="panel">
        <h2>Assigned invoices</h2>

        {loading && (
          <div className="empty">
            Loading invoices...
          </div>
        )}

        {error && (
          <div className="status err">
            Failed to load invoices: {error}
          </div>
        )}

        {!loading && !error && (
          <DataTable rows={data.invoices || []} />
        )}
      </section>

      <InvoiceStatus api={api} setData={setData} />
    </>
  );
}

function InvoiceStatus({ api, setData }) {
  const [status, setStatus] = useState(null);

  async function submit(event) {
    event.preventDefault();
    try {
      const values = formValues(event.currentTarget);
      await api(`/inspection-officer/invoices/${values.invoice_id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: values.status }),
      });
      const invoices = await api("/inspection-officer/get_invoices");
      setData((current) => ({ ...current, invoices }));
      setStatus({ ok: true, message: "Invoice status updated." });
    } catch (error) {
      setStatus({ ok: false, message: error.message });
    }
  }

  return (
    <form className="panel" onSubmit={submit}>
      <h2><ClipboardCheck size={20} /> Update invoice status</h2>
      <Field label="Invoice ID" name="invoice_id" type="number" required />
      <SelectField label="Status" name="status" options={["APPROVED", "REJECTED", "PENDING"]} />
      <button className="primary-btn">Update status</button>
      <Status state={status} />
    </form>
  );
}

function SimplePostForm({ title, endpoint, api, fields, numeric = [] }) {
  const [status, setStatus] = useState(null);

  async function submit(event) {
    event.preventDefault();
    try {
      await api(endpoint, {
        method: "POST",
        body: JSON.stringify(normalizeNumbers(formValues(event.currentTarget), numeric)),
      });
      event.currentTarget.reset();
      setStatus({ ok: true, message: "Saved successfully." });
    } catch (error) {
      setStatus({ ok: false, message: error.message });
    }
  }

  return (
    <form className="panel" onSubmit={submit}>
      <h2><FileCheck size={20} /> {title}</h2>
      <div className="grid two">
        {fields.map(([label, name, type = "text", defaultValue = ""]) => (
          <Field key={name} label={label} name={name} type={type} defaultValue={defaultValue} required />
        ))}
      </div>
      <button className="primary-btn">Submit</button>
      <Status state={status} />
    </form>
  );
}

function Metric({ value, label }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
