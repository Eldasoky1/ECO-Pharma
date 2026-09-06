"""Smart Eco-Pharma Hub — FastAPI application entry point."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings

# ---------------------------------------------------------------------------
# Routers — imported with fallbacks so the app boots even if a router module
# does not exist yet during incremental development.
# ---------------------------------------------------------------------------

_inventory_router = None
_interactions_router = None
_iot_ingestion_router = None
_pharmacovigilance_router = None
_auth_router = None

try:
    from .routers import auth as _auth_mod  # type: ignore[import-not-found]

    _auth_router = _auth_mod.router
except ImportError:
    pass

try:
    from .routers import inventory as _inventory_mod  # type: ignore[import-not-found]

    _inventory_router = _inventory_mod.router
except ImportError:
    pass

try:
    from .routers import interactions as _interactions_mod  # type: ignore[import-not-found]

    _interactions_router = _interactions_mod.router
except ImportError:
    pass

try:
    from .routers import iot_ingestion as _iot_mod  # type: ignore[import-not-found]

    _iot_ingestion_router = _iot_mod.router
except ImportError:
    pass

try:
    from .routers import pharmacovigilance as _pharma_mod  # type: ignore[import-not-found]

    _pharmacovigilance_router = _pharma_mod.router
except ImportError:
    pass


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan — startup / shutdown hooks live here."""
    # Startup: nothing yet — database clients are module-level singletons.
    yield
    # Shutdown: nothing yet — add cleanup when background tasks exist.


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Smart Eco-Pharma Hub",
    description="AI-powered pharmaceutical inventory, drug interactions, IoT ingestion, and pharmacovigilance platform.",
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------


@app.exception_handler(404)
async def not_found_handler(_request: Request, _exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=404,
        content={"error": "not_found", "detail": "The requested resource was not found."},
    )


@app.exception_handler(422)
async def validation_error_handler(_request: Request, _exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"error": "validation_error", "detail": "The request body failed validation."},
    )


@app.exception_handler(500)
async def internal_error_handler(_request: Request, _exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"error": "internal_error", "detail": "An unexpected error occurred."},
    )


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
    }


# ---------------------------------------------------------------------------
# Router registration
# ---------------------------------------------------------------------------

if _inventory_router is not None:
    app.include_router(_inventory_router, prefix="/api/v1/inventory", tags=["inventory"])

if _interactions_router is not None:
    app.include_router(_interactions_router, prefix="/api/v1/interactions", tags=["interactions"])

if _iot_ingestion_router is not None:
    app.include_router(_iot_ingestion_router, prefix="/api/v1/iot", tags=["iot"])

if _pharmacovigilance_router is not None:
    app.include_router(_pharmacovigilance_router, prefix="/api/v1/pharmacovigilance", tags=["pharmacovigilance"])

if _auth_router is not None:
    app.include_router(_auth_router, prefix="/api/v1/auth", tags=["auth"])
