const configuredApiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || undefined;

export const DIRECT_API_BASE_URL = configuredApiBaseUrl ?? "http://localhost:5199";

// Production REST calls go through Next rewrites so auth cookies stay first-party.
export const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "" : DIRECT_API_BASE_URL;

function describeApiTarget() {
  return API_BASE_URL || "the same-origin /api proxy";
}

export type ApiErrorKind =
  | "validation"
  | "notFound"
  | "conflict"
  | "forbidden"
  | "server"
  | "network";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly kind: ApiErrorKind,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 422) return "validation";
  if (status === 404) return "notFound";
  if (status === 409) return "conflict";
  if (status === 403) return "forbidden";
  return "server";
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return (body?.message as string) || res.statusText || "Request failed.";
  } catch {
    return res.statusText || "Request failed.";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    const isFetchFailure =
      err instanceof TypeError &&
      err.message.toLowerCase().includes("failed to fetch");
    const message = isFetchFailure
      ? `Cannot reach the API at ${describeApiTarget()}. Start the backend (npm run run:backend) and try again.`
      : err instanceof Error
        ? err.message
        : "Network error";
    throw new ApiError(0, "network", message);
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    throw new ApiError(res.status, kindFromStatus(res.status), message);
  }

  return res.json() as Promise<T>;
}
