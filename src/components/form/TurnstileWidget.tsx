import { useEffect, useRef } from "react";
import { ENV } from "../../config/env";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: any) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export function TurnstileWidget({
  onToken,
  onExpire,
}: {
  onToken: (token: string) => void;
  onExpire?: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    const id = "cf-turnstile-script";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }

    const interval = setInterval(() => {
      if (window.turnstile && ref.current && !widgetId.current) {
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: ENV.TURNSTILE_SITE_KEY,
          callback: (token: string) => onToken(token),
          "expired-callback": () => onExpire?.(),
          "error-callback": () => onExpire?.(),
          theme: "light",
        });
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [onToken, onExpire]);

  return <div ref={ref} />;
}
