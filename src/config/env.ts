export const ENV = {
  API_URL: import.meta.env.VITE_API_URL as string,
  TURNSTILE_SITE_KEY: import.meta.env.VITE_TURNSTILE_SITE_KEY as string,
  BASENAME: "/registrodrc/",
};

if (!ENV.API_URL) throw new Error("Falta VITE_API_URL");
if (!ENV.TURNSTILE_SITE_KEY) throw new Error("Falta VITE_TURNSTILE_SITE_KEY");
