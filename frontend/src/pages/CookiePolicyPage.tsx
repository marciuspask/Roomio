import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mt-10 first:mt-0">
    <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
    <div className="mt-3 space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

type CookieRow = {
  name: string;
  purpose: string;
  duration: string;
  category: "Essential" | "Functional" | "Analytics";
};

const cookies: CookieRow[] = [
  {
    name: "__clerk_*",
    purpose: "Manages your authenticated session (login state, security tokens).",
    duration: "Session / 1 year",
    category: "Essential",
  },
  {
    name: "sidebar:state",
    purpose: "Remembers whether the dashboard sidebar is open or collapsed.",
    duration: "7 days",
    category: "Functional",
  },
  {
    name: "roomio_cookie_consent",
    purpose: "Stores your cookie preferences so we don't ask again.",
    duration: "1 year",
    category: "Essential",
  },
];

const categoryColor: Record<CookieRow["category"], string> = {
  Essential: "bg-green-50 text-green-700 border-green-200",
  Functional: "bg-blue-50 text-blue-700 border-blue-200",
  Analytics: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const CookiePolicyPage = () => (
  <div className="min-h-screen bg-background">
    <Nav />

    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-4xl font-extrabold text-foreground">Cookie Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 1 June 2025</p>

      <div className="mt-10 space-y-0">
        <Section title="1. What are cookies?">
          <p>
            Cookies are small text files stored on your device when you visit a website. They help
            the site remember information about your visit — such as whether you are logged in —
            and allow us to improve your experience over time.
          </p>
          <p>
            We also use <strong className="text-foreground">localStorage</strong> (a similar
            browser storage mechanism) to save your cookie preferences and certain UI settings.
          </p>
        </Section>

        <Section title="2. Cookie categories we use">
          <div className="mt-2 space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <span className="inline-block rounded border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                Essential
              </span>
              <p className="mt-2">
                Strictly necessary for the site to function. These cannot be disabled. Examples:
                authentication tokens from Clerk, your cookie consent preference.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <span className="inline-block rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                Functional
              </span>
              <p className="mt-2">
                Improve your experience by remembering your preferences (e.g. sidebar open/closed
                state). Enabled by default but you can opt out in the cookie banner.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <span className="inline-block rounded border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                Analytics
              </span>
              <p className="mt-2">
                Help us understand how visitors use Roomio so we can make it better. Analytics
                cookies are only set after you give consent. Currently, no third-party analytics
                tool is active — this category is reserved for future use.
              </p>
            </div>
          </div>
        </Section>

        <Section title="3. Cookies we use">
          <div className="mt-2 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[560px] text-xs">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Purpose</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Duration</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Category</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((c, i) => (
                  <tr key={c.name} className={i % 2 === 0 ? "bg-background" : "bg-card"}>
                    <td className="px-4 py-3 font-mono text-foreground">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.purpose}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.duration}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded border px-1.5 py-0.5 text-xs font-semibold ${categoryColor[c.category]}`}
                      >
                        {c.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="4. Third-party cookies">
          <p>
            <strong className="text-foreground">Clerk</strong> (our authentication provider) sets
            cookies to maintain your login session. These are essential cookies and cannot be
            disabled without breaking authentication. Clerk's cookie usage is governed by their{" "}
            <a
              href="https://clerk.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              privacy policy
            </a>
            .
          </p>
          <p>
            We do not use any advertising or social-media tracking cookies.
          </p>
        </Section>

        <Section title="5. Managing your preferences">
          <p>You can change your cookie preferences at any time:</p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              <strong className="text-foreground">Cookie banner</strong> — click "Manage
              preferences" in the banner at the bottom of the screen. If the banner has already
              been dismissed, clear your browser's localStorage for this site to see it again.
            </li>
            <li>
              <strong className="text-foreground">Browser settings</strong> — most browsers let
              you block or delete cookies. Note that blocking essential cookies will break login
              functionality.
            </li>
          </ul>
          <p>
            Clearing cookies or localStorage will reset your consent preference and the banner will
            reappear on your next visit.
          </p>
        </Section>

        <Section title="6. More information">
          <p>
            For full details on how we handle your personal data, see our{" "}
            <Link to="/privacy-policy" className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            . Questions? Email{" "}
            <a href="mailto:privacy@roomio.lt" className="underline hover:text-foreground transition-colors">
              privacy@roomio.lt
            </a>
            .
          </p>
        </Section>
      </div>
    </div>

    <Footer />
  </div>
);

export default CookiePolicyPage;
