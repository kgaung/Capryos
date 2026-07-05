/* eslint-disable @typescript-eslint/no-explicit-any */
type Filter = { field: string; value: unknown; op: 'eq' | 'neq' | 'overlaps' };

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail_url?: string;
  tags: string[];
  status: 'draft' | 'published';
  author: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  read_time: number;
  views: number;
}

export interface Subscriber {
  id: string;
  email: string;
  name?: string | null;
  subscribed_at: string;
  status: 'active' | 'unsubscribed';
}

export interface ContentSuggestion {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'implemented';
  created_at: string;
}

export interface Analytics {
  total_posts: number;
  total_subscribers: number;
  total_views: number;
  recent_posts: BlogPost[];
  popular_posts: BlogPost[];
}

type Session = { user: { email: string } };
type ApiError = { message: string; code?: string };
type ApiResult = { data: any; count: number | null; error: ApiError | null };

const listeners = new Set<(_event: string, session: Session | null) => void>();

const request = async (path: string, init: RequestInit = {}): Promise<ApiResult> => {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => ({})) as { data?: unknown; user?: unknown; count?: number; error?: ApiError };
  if (!response.ok) return { data: null, count: 0, error: payload.error || { message: 'Request failed' } };
  return { data: payload.data ?? payload.user ?? null, count: payload.count ?? null, error: null };
};

class QueryBuilder {
  private filters: Filter[] = [];
  private orderField = 'created_at';
  private ascending = false;
  private rowLimit?: number;
  private mutation: 'insert' | 'update' | 'delete' | null = null;
  private payload: Record<string, unknown> | Record<string, unknown>[] | null = null;
  private wantsSingle = false;
  private wantsMaybeSingle = false;

  constructor(private table: string, private options?: { count?: 'exact' }) {}

  select(columns = '*', options?: { count?: 'exact' }) {
    void columns;
    this.options = options ?? this.options;
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push({ field, value, op: 'eq' });
    return this;
  }

  neq(field: string, value: unknown) {
    this.filters.push({ field, value, op: 'neq' });
    return this;
  }

  overlaps(field: string, value: unknown[]) {
    this.filters.push({ field, value, op: 'overlaps' });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    this.ascending = options?.ascending ?? false;
    return this;
  }

  limit(value: number) {
    this.rowLimit = value;
    return this;
  }

  insert(value: Record<string, unknown>[]) {
    this.mutation = 'insert';
    this.payload = value[0] ?? {};
    return this;
  }

  update(value: Record<string, unknown>) {
    this.mutation = 'update';
    this.payload = value;
    return this;
  }

  delete() {
    this.mutation = 'delete';
    return this;
  }

  single() {
    this.wantsSingle = true;
    return this;
  }

  maybeSingle() {
    this.wantsMaybeSingle = true;
    return this;
  }

  private async execute(): Promise<ApiResult> {
    if (this.mutation === 'insert') {
      return request(`/api/${this.table}`, { method: 'POST', body: JSON.stringify(this.payload) });
    }

    if (this.mutation === 'update') {
      const id = this.filters.find((filter) => filter.field === 'id' && filter.op === 'eq')?.value;
      return request(`/api/${this.table}`, { method: 'PATCH', body: JSON.stringify({ ...(this.payload as object), id }) });
    }

    if (this.mutation === 'delete') {
      const ids = this.filters.filter((filter) => filter.field === 'id' && filter.op === 'eq').map((filter) => filter.value);
      return request(`/api/${this.table}`, { method: 'DELETE', body: JSON.stringify({ ids }) });
    }

    const params = new URLSearchParams();
    params.set('order', this.orderField);
    params.set('direction', this.ascending ? 'asc' : 'desc');
    if (this.rowLimit) params.set('limit', String(this.rowLimit));
    for (const filter of this.filters) {
      if (filter.op === 'eq') params.set(filter.field, String(filter.value));
      if (filter.op === 'neq' && filter.field === 'id') params.set('not_id', String(filter.value));
      if (filter.op === 'overlaps' && filter.field === 'tags') params.set('overlaps_tags', (filter.value as string[]).join(','));
    }

    const result = await request(`/api/${this.table}?${params.toString()}`);
    if (this.wantsSingle || this.wantsMaybeSingle) {
      const rows = Array.isArray(result.data) ? result.data : [];
      if (!rows[0] && this.wantsSingle) return { data: null, error: { code: 'PGRST116', message: 'Row not found' }, count: 0 };
      return { ...result, data: rows[0] ?? null };
    }
    return result;
  }

  then<TResult1 = ApiResult, TResult2 = never>(
    onfulfilled?: ((value: ApiResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const supabase = {
  from(table: string) {
    return new QueryBuilder(table);
  },
  channel(name?: string) {
    void name;
    return {
      on(event: string, filter: Record<string, unknown>, callback: () => void) {
        void event;
        void filter;
        void callback;
        return this;
      },
      subscribe() {
        return { unsubscribe() {} };
      },
    };
  },
  auth: {
    async getSession() {
      const response = await fetch('/api/auth', { credentials: 'include' });
      const { user } = await response.json();
      return { data: { session: user ? { user } : null } };
    },
    onAuthStateChange(callback: (_event: string, session: { user: { email: string } } | null) => void) {
      listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              listeners.delete(callback);
            },
          },
        },
      };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const result = await request('/api/auth', { method: 'POST', body: JSON.stringify({ email, password }) });
      if (result.error) return { data: null, error: result.error };
      const session: Session = { user: result.data as { email: string } };
      listeners.forEach((listener) => listener('SIGNED_IN', session));
      return { data: { session, user: session.user }, error: null };
    },
    async signOut() {
      const result = await request('/api/auth', { method: 'DELETE' });
      listeners.forEach((listener) => listener('SIGNED_OUT', null));
      return { error: result.error };
    },
  },
};
