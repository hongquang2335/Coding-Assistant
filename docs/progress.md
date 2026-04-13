# Progress Report

Cap nhat: 2026-04-13

## Tong quan
Du an hien da vuot moc MVP foundation ban dau. Phan upload, quan ly project, explorer va source preview da duoc noi thong tu frontend toi backend. Phan AI review van chua duoc implement.

## Da hoan thanh
- FastAPI app khoi dong duoc va co `GET /health`.
- SQLite storage duoc tao tu dong khi startup.
- Upload ZIP source code qua `POST /api/projects/upload`.
- Kiem tra duoi file upload va chan path traversal khi extract.
- Luu metadata project: `id`, `name`, `status`, `created_at`, `file_count`.
- Liet ke project qua `GET /api/projects`.
- Dung source tree qua `GET /api/projects/{project_id}/tree`.
- Doc file text qua `GET /api/projects/{project_id}/source`.
- Frontend co 3 cot va da noi API that:
  - UploadBox
  - ProjectList
  - ProjectExplorer
  - Code Viewer

## Dang o muc nao so voi roadmap
- Phase 0: xong.
- Phase 1: xong.
- Phase 2: da lam mot phan.
  - Da co project tree va source endpoint.
  - Chua co Python AST, symbol parsing, semantic context.
- Phase 3: chua bat dau.
- Phase 4: chua bat dau.

## Uoc tinh tien do
- Foundation va source browsing: khoang 80-90% xong.
- Toan bo san pham theo roadmap hien tai: khoang 45-55% xong.

## Khoang trong hien tai
- Chua co test backend/frontend.
- Chua co review engine hoac LLM integration.
- Chua co parser cho Python module/class/function.
- Chua co retrieval/indexing.
- Review panel tren frontend moi la placeholder.

## Buoc tiep theo de hoan thien
1. Bo sung parser cho file Python va sinh ra symbol tree.
2. Them endpoint tra context theo file/symbol.
3. Noi review panel voi du lieu that thay vi placeholder.
4. Bo sung test toi thieu cho upload, tree va source endpoint.
