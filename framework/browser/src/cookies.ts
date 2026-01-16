import { Cookie, CookieOptions } from "@broccoliapps/shared";

const set = (cookie: Cookie) => {
  document.cookie = cookie.toString();
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

const remove = (key: string, options: Omit<CookieOptions, "maxAge"> = {}) => {
  set(Cookie.delete(key, options));
};

export const cookies = {
  set,
  get,
  remove,
};
