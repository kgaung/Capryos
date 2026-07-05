import type { Config } from "@netlify/functions";
import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "../../db/index.js";
import { blogPosts, contentSuggestions, subscribers } from "../../db/schema.js";

const json = (body: unknown, init: ResponseInit = {}) =>
  Response.json(body, { headers: { "Cache-Control": "no-store", ...init.headers }, ...init });

const toBlogPost = (row: typeof blogPosts.$inferSelect) => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  excerpt: row.excerpt,
  content: row.content,
  thumbnail_url: row.thumbnailUrl,
  tags: row.tags ?? [],
  status: row.status,
  author: row.author,
  created_at: row.createdAt.toISOString(),
  updated_at: row.updatedAt.toISOString(),
  published_at: row.publishedAt?.toISOString() ?? null,
  read_time: row.readTime,
  views: row.views,
});

const toSubscriber = (row: typeof subscribers.$inferSelect) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  subscribed_at: row.subscribedAt.toISOString(),
  status: row.status,
});

const toSuggestion = (row: typeof contentSuggestions.$inferSelect) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  subject: row.subject,
  message: row.message,
  status: row.status,
  created_at: row.createdAt.toISOString(),
});

const cookieName = "capryos_admin";
const sessionSecret = () => process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || process.env.NETLIFY_SITE_ID || "capryos-local-admin";

const signSession = (issuedAt = Date.now()) => {
  const payload = String(issuedAt);
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};

const verifySession = (value: string | null) => {
  if (!value) return false;
  const [issuedAt, signature] = value.split(".");
  if (!issuedAt || !signature) return false;
  const timestamp = Number(issuedAt);
  if (!Number.isFinite(timestamp) || Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) return false;

  const expected = createHmac("sha256", sessionSecret()).update(issuedAt).digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return signatureBuffer.length === expectedBuffer.length && timingSafeEqual(signatureBuffer, expectedBuffer);
};

const getCookie = (req: Request, name: string) => {
  const cookie = req.headers.get("cookie") ?? "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) ?? null;
};

const isAuthed = (req: Request) => verifySession(getCookie(req, cookieName));

const requireAdmin = (req: Request) => {
  if (!isAuthed(req)) return json({ error: { message: "Unauthorized" } }, { status: 401 });
  return null;
};

const requireSameOrigin = (req: Request) => {
  const origin = req.headers.get("origin");
  if (!origin) return null;
  const requestOrigin = new URL(req.url).origin;
  if (origin !== requestOrigin) return json({ error: { message: "Invalid request origin" } }, { status: 403 });
  return null;
};

const getResource = (req: Request) =>
  new URL(req.url).pathname
    .replace(/^\/api\/?/, "")
    .replace(/^\/\.netlify\/functions\/api\/?/, "")
    .split("/")[0];
const dateOrNull = (value: unknown) => (typeof value === "string" && value ? new Date(value) : null);
const cleanLimit = (value: string | null) => Math.min(Math.max(Number(value || "100") || 100, 1), 100);
const secureCookie = (req: Request) => new URL(req.url).protocol === "https:" ? "; Secure" : "";

export default async (req: Request) => {
  try {
    const url = new URL(req.url);
    const resource = getResource(req);

    if (resource === "auth") {
      if (req.method === "GET") return json({ user: isAuthed(req) ? { email: process.env.ADMIN_EMAIL || "admin" } : null });
      if (req.method === "DELETE") {
        return json({ ok: true }, { headers: { "Set-Cookie": `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` } });
      }
      if (req.method === "POST") {
        const badOrigin = requireSameOrigin(req);
        if (badOrigin) return badOrigin;
        const { email, password } = await req.json();
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) {
          return json({ error: { message: "Admin credentials are not configured" } }, { status: 500 });
        }
        if (email !== adminEmail || password !== adminPassword) {
          return json({ error: { message: "Invalid email or password" } }, { status: 401 });
        }
        return json(
          { user: { email } },
          { headers: { "Set-Cookie": `${cookieName}=${encodeURIComponent(signSession())}; Path=/; HttpOnly; SameSite=Lax${secureCookie(req)}; Max-Age=604800` } },
        );
      }
    }

    if (resource === "blog_posts") {
      if (req.method === "GET") {
        const id = url.searchParams.get("id");
        const slug = url.searchParams.get("slug");
        const status = url.searchParams.get("status");
        const notId = url.searchParams.get("not_id");
        const limit = cleanLimit(url.searchParams.get("limit"));
        const tagList = url.searchParams.get("overlaps_tags")?.split(",").filter(Boolean) ?? [];
        const adminRead = isAuthed(req);
        if (status !== "published" && !adminRead) {
          return json({ error: { message: "Unauthorized" } }, { status: 401 });
        }
        const filters = [
          id ? eq(blogPosts.id, id) : undefined,
          slug ? eq(blogPosts.slug, slug) : undefined,
          status ? eq(blogPosts.status, status) : adminRead ? undefined : eq(blogPosts.status, "published"),
          notId ? ne(blogPosts.id, notId) : undefined,
          tagList.length ? sql`${blogPosts.tags} ?| array[${sql.join(tagList.map((tag) => sql`${tag}`), sql`, `)}]` : undefined,
        ].filter(Boolean);
        const rows = await db
          .select()
          .from(blogPosts)
          .where(filters.length ? and(...filters) : undefined)
          .orderBy(desc(url.searchParams.get("order") === "published_at" ? blogPosts.publishedAt : blogPosts.createdAt))
          .limit(limit);
        return json({ data: rows.map(toBlogPost), count: rows.length });
      }

      if (req.method === "POST") {
        const badOrigin = requireSameOrigin(req);
        if (badOrigin) return badOrigin;
        const denied = requireAdmin(req);
        if (denied) return denied;
        const body = await req.json();
        const [row] = await db.insert(blogPosts).values({
          title: body.title,
          slug: body.slug,
          excerpt: body.excerpt ?? "",
          content: body.content,
          thumbnailUrl: body.thumbnail_url ?? null,
          tags: body.tags ?? [],
          status: body.status ?? "draft",
          author: body.author ?? "Admin",
          readTime: body.read_time ?? 5,
          publishedAt: dateOrNull(body.published_at),
        }).returning();
        return json({ data: toBlogPost(row) }, { status: 201 });
      }

      if (req.method === "PATCH") {
        const body = await req.json();
        const isViewOnly = Object.keys(body).every((key) => ["id", "views"].includes(key));
        if (!isViewOnly) {
          const badOrigin = requireSameOrigin(req);
          if (badOrigin) return badOrigin;
          const denied = requireAdmin(req);
          if (denied) return denied;
        }
        const updateData: Partial<typeof blogPosts.$inferInsert> = { updatedAt: new Date() };
        if ("title" in body) updateData.title = body.title;
        if ("slug" in body) updateData.slug = body.slug;
        if ("excerpt" in body) updateData.excerpt = body.excerpt ?? "";
        if ("content" in body) updateData.content = body.content;
        if ("thumbnail_url" in body) updateData.thumbnailUrl = body.thumbnail_url ?? null;
        if ("tags" in body) updateData.tags = body.tags ?? [];
        if ("status" in body) updateData.status = body.status;
        if ("author" in body) updateData.author = body.author ?? "Admin";
        if ("read_time" in body) updateData.readTime = body.read_time ?? 5;
        if ("views" in body) updateData.views = body.views;
        if ("published_at" in body) updateData.publishedAt = dateOrNull(body.published_at);
        const [row] = await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, body.id)).returning();
        return json({ data: row ? toBlogPost(row) : null });
      }

      if (req.method === "DELETE") {
        const badOrigin = requireSameOrigin(req);
        if (badOrigin) return badOrigin;
        const denied = requireAdmin(req);
        if (denied) return denied;
        const { ids } = await req.json();
        await db.delete(blogPosts).where(inArray(blogPosts.id, ids));
        return json({ data: null });
      }
    }

    if (resource === "subscribers") {
      if (["GET", "PATCH", "DELETE"].includes(req.method)) {
        const denied = requireAdmin(req);
        if (denied) return denied;
      }
      if (req.method === "GET") {
        const rows = await db.select().from(subscribers).orderBy(desc(subscribers.subscribedAt));
        return json({ data: rows.map(toSubscriber), count: rows.length });
      }
      if (req.method === "POST") {
        const badOrigin = requireSameOrigin(req);
        if (badOrigin) return badOrigin;
        const body = await req.json();
        const [row] = await db.insert(subscribers).values({
          email: body.email,
          name: body.name ?? null,
          status: body.status ?? "active",
        }).returning();
        return json({ data: toSubscriber(row) }, { status: 201 });
      }
      if (req.method === "PATCH") {
        const badOrigin = requireSameOrigin(req);
        if (badOrigin) return badOrigin;
        const body = await req.json();
        await db.update(subscribers).set({ status: body.status }).where(eq(subscribers.id, body.id));
        return json({ data: null });
      }
      if (req.method === "DELETE") {
        const badOrigin = requireSameOrigin(req);
        if (badOrigin) return badOrigin;
        const { ids } = await req.json();
        await db.delete(subscribers).where(inArray(subscribers.id, ids));
        return json({ data: null });
      }
    }

    if (resource === "content_suggestions") {
      if (["GET", "PATCH", "DELETE"].includes(req.method)) {
        const denied = requireAdmin(req);
        if (denied) return denied;
      }
      if (req.method === "GET") {
        const rows = await db.select().from(contentSuggestions).orderBy(desc(contentSuggestions.createdAt));
        return json({ data: rows.map(toSuggestion), count: rows.length });
      }
      if (req.method === "POST") {
        const badOrigin = requireSameOrigin(req);
        if (badOrigin) return badOrigin;
        const body = await req.json();
        const [row] = await db.insert(contentSuggestions).values(body).returning();
        return json({ data: toSuggestion(row) }, { status: 201 });
      }
      if (req.method === "PATCH") {
        const badOrigin = requireSameOrigin(req);
        if (badOrigin) return badOrigin;
        const body = await req.json();
        await db.update(contentSuggestions).set({ status: body.status }).where(eq(contentSuggestions.id, body.id));
        return json({ data: null });
      }
    }

    return json({ error: { message: "Not found" } }, { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    const code = message.includes("duplicate key") ? "23505" : undefined;
    return json({ error: { message, code } }, { status: code === "23505" ? 409 : 500 });
  }
};

export const config: Config = {
  path: "/api/*",
};
