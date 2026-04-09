# AI Codebase Reviewer v1

Phase hi?n t?i: `Phase 0 + Phase 1`.

## Ðã có
- Backend FastAPI v?i API:
  - `GET /health`
  - `GET /api/projects`
  - `POST /api/projects/upload` (ZIP)
- Upload ZIP, extract an toàn, luu metadata vào SQLite local.
- Frontend React + Vite v?i layout 3 c?t:
  - C?t trái: upload + danh sách project
  - C?t gi?a/ph?i: placeholder cho code viewer và review

## Ch?y backend
```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Ch?y frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend ch?y t?i `http://localhost:5173`, backend t?i `http://localhost:8000`.

## Next
- Phase 2: parse Python AST + project tree + source endpoint.
- Phase 3: chunk/index + retrieval.
- Phase 4: review structured output + test suggestion.
