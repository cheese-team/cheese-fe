export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly provider?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function readApiError(response: Response) {
  let message = `API 요청에 실패했습니다. (${response.status})`;
  let code: string | undefined;
  let provider: string | undefined;

  try {
    const body: unknown = await response.json();

    if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
      if ('code' in body && typeof body.code === 'string') {
        code = body.code;
      }

      if ('provider' in body && typeof body.provider === 'string') {
        provider = body.provider;
      }

      const errorMessage = 'message' in body ? body.message : undefined;

      if (typeof errorMessage === 'string' && errorMessage.trim()) {
        message = errorMessage.trim();
      }

      if (Array.isArray(errorMessage)) {
        const messages = errorMessage
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean);

        if (messages.length > 0) {
          message = messages.join(', ');
        }
      }
    }
  } catch {
    // JSON 형식이 아닌 오류 응답
  }

  return new ApiError(message, response.status, code, provider);
}

type ApiRequestOptions = RequestInit & {
  query?: Record<string, string | undefined>;
};

function createApiUrl(path: string, query?: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `${path}?${queryString}` : path;
}

export async function apiClient<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  const { query, ...requestInit } = options ?? {};

  const headers = new Headers(requestInit.headers);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (requestInit.body && !(requestInit.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(createApiUrl(path, query), {
    ...requestInit,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    throw await readApiError(response);
  }

  return (await response.json()) as T;
}
