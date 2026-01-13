import type { Cookie } from "@broccoliapps/shared";

export type CookieOptions = Omit<Cookie, "name" | "value">;

const set = (name: string, value: string, options: CookieOptions = {}) => {
  let cookieString = `${name}=${encodeURIComponent(value)}`;

  if (options.maxAge !== undefined) {
    cookieString += `; Max-Age=${options.maxAge}`;
  }

  if (options.path) {
    cookieString += `; Path=${options.path}`;
  }

  if (options.domain) {
    cookieString += `; Domain=${options.domain}`;
  }

  if (options.sameSite) {
    cookieString += `; SameSite=${options.sameSite}`;
  }

  if (options.secure) {
    cookieString += "; Secure";
  }

  if (options.httpOnly) {
    cookieString += "; HttpOnly";
  }

  document.cookie = cookieString;
};

const get = (name: string): string | null => {
  const cookies = document.cookie.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name && cookieValue !== undefined) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
};

const remove = (name: string, options: Omit<CookieOptions, "maxAge"> = {}) => {
  set(name, "", { ...options, maxAge: 0 });
};

export const cookies = {
  set,
  get,
  remove,
};
