"""
Cadillac demo gateway: login, static SPA, proxy orchestration to aiphotobooth internal API.
"""

from __future__ import annotations

import json
import logging
import os
import secrets
import time as _time
import uuid
from pathlib import Path
from typing import Annotated, Optional

import httpx
from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.middleware.sessions import SessionMiddleware

from prompts_loader import load_prompts, public_prompt_list, resolve_asset_path

_dbg_logger = logging.getLogger("cadillac-demo")
if not _dbg_logger.handlers:
    _h = logging.StreamHandler()
    _h.setFormatter(logging.Formatter("%(message)s"))
    _dbg_logger.addHandler(_h)
_dbg_logger.setLevel(logging.INFO)


# #region agent log
def _dbg(hyp: str, location: str, message: str, data: dict | None = None) -> None:
    """NDJSON-on-stdout for debug session 14b4e8 (grep `DBG14b4e8` in Dokploy logs)."""
    try:
        payload = {
            "sessionId": "14b4e8",
            "runId": "cadillac_gateway",
            "hypothesisId": hyp,
            "location": location,
            "message": message,
            "data": data or {},
            "timestamp": int(_time.time() * 1000),
        }
        _dbg_logger.info("DBG14b4e8 " + json.dumps(payload, default=str))
    except Exception:
        pass
# #endregion


def _env_strip(key: str, default: str) -> str:
    raw = os.environ.get(key)
    if raw is None:
        return default
    s = str(raw).strip()
    return s if s else default


SESSION_SECRET = os.environ.get("SESSION_SECRET", "change-me-in-production")
SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE", "").lower() in ("1", "true", "yes")
DEMO_USER = _env_strip("DEMO_LOGIN_USER", "cadillac")
DEMO_PASSWORD = _env_strip("DEMO_LOGIN_PASSWORD", "cadillac")
INTERNAL_SECRET = (
    os.environ.get("CADILLAC_INTERNAL_SECRET") or os.environ.get("INTERNAL_API_SECRET") or ""
).strip()
AIPHOTOBOOTH_BASE = _env_strip(
    "AIPHOTOBOOTH_INTERNAL_BASE_URL", "http://localhost:8000"
).rstrip("/")
# Public base URL for browser-loaded images / QR (HTTPS host of aiphotobooth API)
AIPHOTOBOOTH_PUBLIC = (os.environ.get("AIPHOTOBOOTH_PUBLIC_URL") or "").strip().rstrip("/")

PROMPTS_FILE = Path(os.environ.get("PROMPTS_FILE", "/app/prompts.json"))
ASSETS_BASE = Path(os.environ.get("ASSETS_BASE", "/app/assets"))

CAPTURE_DIR = Path(os.environ.get("CAPTURE_DIR", "/tmp/cadillac-captures"))
CAPTURE_DIR.mkdir(parents=True, exist_ok=True)

DIST_DIR = Path(os.environ.get("DIST_DIR", "/app/static"))

app = FastAPI(title="Cadillac demo gateway")

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    same_site="lax",
    https_only=SESSION_COOKIE_SECURE,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def require_auth(request: Request) -> None:
    if not request.session.get("authenticated"):
        raise HTTPException(status_code=401, detail="Not authenticated")


Auth = Annotated[None, Depends(require_auth)]


class LoginBody(BaseModel):
    username: str
    password: str


@app.post("/api/login")
async def login(request: Request, body: LoginBody):
    if body.username == DEMO_USER and body.password == DEMO_PASSWORD:
        request.session["authenticated"] = True
        request.session["sid"] = secrets.token_hex(16)
        return {"ok": True}
    raise HTTPException(status_code=401, detail="Invalid credentials")


@app.post("/api/logout")
async def logout(request: Request):
    request.session.clear()
    return {"ok": True}


@app.get("/api/session")
async def session_status(request: Request):
    return {"authenticated": bool(request.session.get("authenticated"))}


@app.get("/api/prompts")
async def list_prompts(_: Auth):
    if not PROMPTS_FILE.is_file():
        # #region agent log
        _dbg("H6", "main.py:list_prompts", "prompts.json missing", {"path": str(PROMPTS_FILE)})
        # #endregion
        raise HTTPException(status_code=500, detail="prompts.json missing")
    data = load_prompts(PROMPTS_FILE)
    out = public_prompt_list(data)
    # #region agent log
    _dbg(
        "H6",
        "main.py:list_prompts",
        "prompts returned",
        {"path": str(PROMPTS_FILE), "count": len(out)},
    )
    # #endregion
    return {"prompts": out}


@app.post("/api/capture")
async def capture(_: Auth, file: UploadFile = File(...)):
    photo_id = uuid.uuid4().hex
    dest = CAPTURE_DIR / f"{photo_id}.jpg"
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")
    dest.write_bytes(raw)
    return {"photo_id": photo_id, "url": f"/api/capture-preview/{photo_id}"}


@app.get("/api/capture-preview/{photo_id}")
async def capture_preview(photo_id: str, _: Auth):
    path = CAPTURE_DIR / f"{photo_id}.jpg"
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(path, media_type="image/jpeg")


@app.post("/api/process")
async def process(
    request: Request,
    _: Auth,
    photo_id: str = Form(...),
    prompt_id: str = Form(...),
    model: Optional[str] = Form(None),
):
    # #region agent log
    _dbg(
        "H3+H4",
        "main.py:process:entry",
        "process entered",
        {
            "AIPHOTOBOOTH_BASE": AIPHOTOBOOTH_BASE,
            "AIPHOTOBOOTH_PUBLIC": AIPHOTOBOOTH_PUBLIC,
            "internal_secret_len": len(INTERNAL_SECRET),
            "photo_id": photo_id,
            "prompt_id": prompt_id,
        },
    )
    # #endregion

    if not INTERNAL_SECRET:
        raise HTTPException(status_code=500, detail="INTERNAL_API_SECRET not configured on gateway")

    if not PROMPTS_FILE.is_file():
        raise HTTPException(status_code=500, detail="prompts.json missing")

    data = load_prompts(PROMPTS_FILE)
    prompt = next((p for p in data.prompts if p.id == prompt_id), None)
    if not prompt:
        raise HTTPException(status_code=400, detail="Unknown prompt_id")

    image_path = CAPTURE_DIR / f"{photo_id}.jpg"
    if not image_path.is_file():
        raise HTTPException(status_code=404, detail="Capture not found")

    url = f"{AIPHOTOBOOTH_BASE}/api/internal/cadillac/process"
    headers = {"X-Internal-Secret": INTERNAL_SECRET}

    files = [
        ("file", ("capture.jpg", image_path.read_bytes(), "image/jpeg")),
    ]
    form = {
        "custom_prompt": prompt.text,
        "style": "cadillac_custom",
    }
    if model:
        form["model"] = model

    # Map referral_paths -> referral_0, referral_1
    for idx, rel in enumerate(prompt.referral_paths[:2]):
        ap = resolve_asset_path(ASSETS_BASE, rel)
        if not ap.is_file():
            raise HTTPException(status_code=500, detail=f"Missing asset: {rel}")
        files.append((f"referral_{idx}", (ap.name, ap.read_bytes(), _guess_mime(ap.suffix))))

    logo_fields = ["logo_0", "logo_1", "logo_2"]
    for idx, rel in enumerate(prompt.logo_paths[:3]):
        ap = resolve_asset_path(ASSETS_BASE, rel)
        if not ap.is_file():
            raise HTTPException(status_code=500, detail=f"Missing asset: {rel}")
        files.append((logo_fields[idx], (ap.name, ap.read_bytes(), _guess_mime(ap.suffix))))

    timeout = httpx.Timeout(300.0, connect=30.0)
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(url, headers=headers, data=form, files=files)
    except httpx.RequestError as e:
        # #region agent log
        _dbg(
            "H4",
            "main.py:process:upstream_connect_error",
            "httpx.RequestError",
            {"url": url, "error_type": type(e).__name__, "error": str(e)[:500]},
        )
        # #endregion
        raise HTTPException(
            status_code=502,
            detail=f"Brak połączenia z backendem ({AIPHOTOBOOTH_BASE}): {e!s}",
        ) from e

    # #region agent log
    _dbg(
        "H1+H2+H3",
        "main.py:process:upstream_response",
        "upstream responded",
        {
            "status": resp.status_code,
            "body_preview": resp.text[:500],
        },
    )
    # #endregion

    if resp.status_code >= 400:
        detail = resp.text[:2000]
        try:
            detail = resp.json()
        except Exception:
            pass
        raise HTTPException(status_code=502, detail=f"Upstream error: {detail}")

    data = resp.json()
    public_base = AIPHOTOBOOTH_PUBLIC or AIPHOTOBOOTH_BASE
    for key in ("url", "qr_url", "download_url"):
        v = data.get(key)
        if isinstance(v, str) and v.startswith("/"):
            data[key] = f"{public_base}{v}"
    # #region agent log
    _dbg(
        "H5",
        "main.py:process:rewrite_urls",
        "URLs rewritten",
        {
            "public_base": public_base,
            "url": data.get("url"),
            "qr_url": data.get("qr_url"),
            "download_url": data.get("download_url"),
        },
    )
    # #endregion
    return JSONResponse(data)


def _guess_mime(suffix: str) -> str:
    s = suffix.lower()
    if s in (".png",):
        return "image/png"
    if s in (".webp",):
        return "image/webp"
    return "image/jpeg"


# Static SPA (must be after API routes if same prefix — API is /api, static is /)
if DIST_DIR.is_dir():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="static")


@app.get("/health")
async def health():
    return {"status": "ok"}
