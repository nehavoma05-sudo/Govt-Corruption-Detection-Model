# Jan Suraksha Fraud Monitor

React + Vite frontend for the supplied FastAPI backend.

## Run frontend

```powershell
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://127.0.0.1:5173
```

## Run backend

From the backend folder:

```powershell
python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

## CORS note

If requests are blocked by the browser, add this to backend `app.py` after `app = FastAPI(...)` and before `app.include_router(...)`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Screens included

- Citizen: login, registration, eligible schemes, local projects, complaints
- Government agent: projects, fraud checks, schemes, uploads, teams, reports
- Contractor: invoice submission
- Inspection officer: assigned invoices, inspections, invoice status updates
