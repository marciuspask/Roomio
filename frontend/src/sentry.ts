import * as Sentry from "@sentry/react";

export function initSentry() {
  Sentry.init({
    dsn: "https://41587a90182b7870b53c3ad1c8be6740@o4511531461902336.ingest.de.sentry.io/4511531476516944",
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD,
  });
}
