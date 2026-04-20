export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,X-Share-Key,X-Admin-Key"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const shareKey = request.headers.get("X-Share-Key");

    if (!shareKey) {
      return json({ error: "missing-share-key" }, 400, corsHeaders);
    }

    const storageKey = "shared-list:" + shareKey;

    if (request.method === "GET") {
      const stored = await env.SHARED_LISTS.get(storageKey, "json");

      return json(
        {
          items: stored && Array.isArray(stored.items) ? stored.items : [],
          updatedAt: stored && stored.updatedAt ? stored.updatedAt : null
        },
        200,
        corsHeaders
      );
    }

    if (request.method === "POST") {
      const adminKey = request.headers.get("X-Admin-Key");

      if (!env.ADMIN_KEY) {
        return json({ error: "missing-server-admin-key" }, 500, corsHeaders);
      }

      if (adminKey !== env.ADMIN_KEY) {
        return json({ error: "invalid-admin-key" }, 401, corsHeaders);
      }

      let payload;

      try {
        payload = await request.json();
      } catch (error) {
        return json({ error: "invalid-json" }, 400, corsHeaders);
      }

      if (!payload || !Array.isArray(payload.items)) {
        return json({ error: "invalid-items" }, 400, corsHeaders);
      }

      const existing = await env.SHARED_LISTS.get(storageKey, "json");
      const currentUpdatedAt = existing && typeof existing.updatedAt === "string"
        ? existing.updatedAt
        : null;
      const expectedUpdatedAt = typeof payload.expectedUpdatedAt === "string"
        ? payload.expectedUpdatedAt
        : null;

      if (currentUpdatedAt !== expectedUpdatedAt) {
        return json(
          {
            error: "conflict",
            message: "remote-data-has-changed",
            currentUpdatedAt: currentUpdatedAt
          },
          409,
          corsHeaders
        );
      }

      const record = {
        items: payload.items,
        updatedAt: typeof payload.updatedAt === "string" ? payload.updatedAt : new Date().toISOString()
      };

      await env.SHARED_LISTS.put(storageKey, JSON.stringify(record));

      return json({ ok: true, updatedAt: record.updatedAt }, 200, corsHeaders);
    }

    return json({ error: "method-not-allowed" }, 405, corsHeaders);
  }
};

function json(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      ...corsHeaders
    }
  });
}
