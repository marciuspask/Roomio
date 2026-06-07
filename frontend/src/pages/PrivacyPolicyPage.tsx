import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mt-10 first:mt-0">
    <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
    <div className="mt-3 space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

const PrivacyPolicyPage = () => (
  <div className="min-h-screen bg-background">
    <Nav />

    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-4xl font-extrabold text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 1 June 2025</p>

      <div className="mt-8 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        This policy explains what personal data Roomio collects, why, and your rights under the{" "}
        <strong className="text-foreground">General Data Protection Regulation (GDPR)</strong>.
      </div>

      <div className="mt-10 space-y-0">
        <Section title="1. Who is the data controller?">
          <p>
            Roomio operates this platform. For any privacy-related questions contact us at{" "}
            <a href="mailto:privacy@roomio.lt" className="underline hover:text-foreground transition-colors">
              privacy@roomio.lt
            </a>
            . We are based in Vilnius, Lithuania (EU).
          </p>
        </Section>

        <Section title="2. What data we collect">
          <p>We collect only what is necessary to provide the service:</p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              <strong className="text-foreground">Account data</strong> — name, email address, and
              profile photo provided when you register.
            </li>
            <li>
              <strong className="text-foreground">Phone number</strong> — collected during phone
              verification to confirm your identity. Stored in hashed form after verification.
            </li>
            <li>
              <strong className="text-foreground">Listing content</strong> — address, photos,
              description, price, and availability that you enter when posting a room.
            </li>
            <li>
              <strong className="text-foreground">Messages</strong> — text sent between users
              through the platform's messaging feature.
            </li>
            <li>
              <strong className="text-foreground">Usage data</strong> — pages visited, browser
              type, device type, and approximate location (country level) collected via cookies and
              server logs.
            </li>
          </ul>
        </Section>

        <Section title="3. Legal basis for processing">
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              <strong className="text-foreground">Contract performance</strong> (Art. 6(1)(b) GDPR)
              — processing your account data and listings is necessary to provide the service you
              signed up for.
            </li>
            <li>
              <strong className="text-foreground">Legitimate interests</strong> (Art. 6(1)(f) GDPR)
              — detecting fraud, ensuring platform safety, and improving the service.
            </li>
            <li>
              <strong className="text-foreground">Consent</strong> (Art. 6(1)(a) GDPR) — analytics
              cookies are only set after you accept them in the cookie banner.
            </li>
            <li>
              <strong className="text-foreground">Legal obligation</strong> (Art. 6(1)(c) GDPR) —
              where required by Lithuanian or EU law.
            </li>
          </ul>
        </Section>

        <Section title="4. Third-party services">
          <p>We use the following sub-processors:</p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              <strong className="text-foreground">Clerk</strong> — handles user authentication and
              session management. Data processed under their{" "}
              <a
                href="https://clerk.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                privacy policy
              </a>
              .
            </li>
            <li>
              <strong className="text-foreground">Supabase</strong> — our database and file storage
              provider (EU region). Data processed under their{" "}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                privacy policy
              </a>
              .
            </li>
            <li>
              <strong className="text-foreground">Twilio</strong> — sends SMS verification codes.
              Your phone number is transmitted to Twilio solely for this purpose and is not stored
              by them after delivery.
            </li>
          </ul>
          <p>We do not sell or rent your personal data to any third party.</p>
        </Section>

        <Section title="5. How long we keep your data">
          <ul className="ml-4 list-disc space-y-1.5">
            <li>Account data is kept for as long as your account is active.</li>
            <li>
              After account deletion, we remove personally identifiable data within{" "}
              <strong className="text-foreground">30 days</strong>.
            </li>
            <li>
              Anonymised usage statistics may be retained indefinitely for analytical purposes.
            </li>
            <li>
              Messages are deleted when both parties delete their accounts or request erasure.
            </li>
          </ul>
        </Section>

        <Section title="6. International transfers">
          <p>
            All primary data is stored within the <strong className="text-foreground">EU/EEA</strong>.
            Where a sub-processor operates outside the EU (e.g. Twilio in the US), appropriate
            safeguards are in place (Standard Contractual Clauses or adequacy decisions).
          </p>
        </Section>

        <Section title="7. Your rights">
          <p>Under GDPR you have the right to:</p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              <strong className="text-foreground">Access</strong> — request a copy of your personal
              data.
            </li>
            <li>
              <strong className="text-foreground">Rectification</strong> — ask us to correct
              inaccurate data.
            </li>
            <li>
              <strong className="text-foreground">Erasure</strong> — ask us to delete your data
              ("right to be forgotten").
            </li>
            <li>
              <strong className="text-foreground">Portability</strong> — receive your data in a
              machine-readable format.
            </li>
            <li>
              <strong className="text-foreground">Restriction</strong> — ask us to limit how we
              process your data.
            </li>
            <li>
              <strong className="text-foreground">Objection</strong> — object to processing based
              on legitimate interests.
            </li>
            <li>
              <strong className="text-foreground">Withdraw consent</strong> — at any time for
              consent-based processing (e.g. analytics cookies).
            </li>
          </ul>
          <p>
            To exercise any right, email{" "}
            <a href="mailto:privacy@roomio.lt" className="underline hover:text-foreground transition-colors">
              privacy@roomio.lt
            </a>
            . We will respond within <strong className="text-foreground">30 days</strong>.
          </p>
          <p>
            You also have the right to lodge a complaint with the{" "}
            <a
              href="https://vdai.lrv.lt"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              State Data Protection Inspectorate of Lithuania (VDAI)
            </a>
            .
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            We use cookies as described in our{" "}
            <Link to="/cookie-policy" className="underline hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
            . You can manage your preferences at any time via the cookie banner.
          </p>
        </Section>

        <Section title="9. Changes to this policy">
          <p>
            We may update this policy from time to time. Material changes will be notified by email
            or a banner on the site. Continuing to use Roomio after changes take effect means you
            accept the updated policy.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            Questions about this policy?{" "}
            <a href="mailto:privacy@roomio.lt" className="underline hover:text-foreground transition-colors">
              privacy@roomio.lt
            </a>
          </p>
        </Section>
      </div>
    </div>

    <Footer />
  </div>
);

export default PrivacyPolicyPage;
