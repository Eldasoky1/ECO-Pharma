"""Supabase client instances.

``anon_client`` — for user-context operations where Row-Level Security (RLS) applies.
``service_client`` — for system-level operations only.  Every usage of
    ``service_client`` MUST be justified with an inline comment explaining why
    RLS bypass is necessary.
"""

from __future__ import annotations

from supabase import Client, create_client

from .config import settings

# Public / anonymous client — respects Supabase RLS policies.
anon_client: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_ANON_KEY,
)

# Service-role client — bypasses RLS.  Use ONLY for server-side operations
# that legitimately require unrestricted access (e.g. admin batch writes,
# system-level aggregations, webhook-triggered migrations).
service_client: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY,
)
