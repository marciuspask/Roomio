import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mt-10 first:mt-0">
    <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
    <div className="mt-3 space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

const TermsOfServicePage = () => (
  <div className="min-h-screen bg-background">
    <Nav />

    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-4xl font-extrabold text-foreground">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 1 June 2025</p>

      <div className="mt-8 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        Please read these terms carefully. By using Roomio you agree to be bound by them. If you do
        not agree, do not use the platform.
      </div>

      <div className="mt-10 space-y-0">
        <Section title="1. About the service">
          <p>
            Roomio ("<strong className="text-foreground">we</strong>", "
            <strong className="text-foreground">us</strong>") is an online platform that lets users
            post room-sharing listings and connect with potential flatmates in Lithuania. We are a
            marketplace — we do not own, manage, or guarantee any of the listed properties.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <ul className="ml-4 list-disc space-y-1.5">
            <li>You must be at least 18 years old to use Roomio.</li>
            <li>You must provide accurate information when registering.</li>
            <li>
              One person may hold one account. Creating multiple accounts to evade a ban is
              prohibited.
            </li>
          </ul>
        </Section>

        <Section title="3. Your account">
          <p>
            You are responsible for keeping your login credentials secure. Notify us immediately at{" "}
            <a href="mailto:hello@roomio.lt" className="underline hover:text-foreground transition-colors">
              hello@roomio.lt
            </a>{" "}
            if you suspect unauthorised access to your account.
          </p>
          <p>
            We may suspend or terminate accounts that violate these terms, post fraudulent content,
            or engage in harassment.
          </p>
        </Section>

        <Section title="4. Posting listings">
          <p>When you post a listing on Roomio you agree that:</p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>All information (price, location, photos, availability) is accurate and up to date.</li>
            <li>You have the right to list the property (you are the owner or authorised agent).</li>
            <li>Photos are real photographs of the actual property.</li>
            <li>
              You will update or remove the listing promptly once the room is no longer available.
            </li>
          </ul>
        </Section>

        <Section title="5. Prohibited conduct">
          <p>The following are strictly prohibited:</p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>Posting false, misleading, or fraudulent listings.</li>
            <li>
              Requesting advance payments, security deposits, or money transfers before a physical
              viewing.
            </li>
            <li>Harassment, discrimination, or threatening behaviour toward other users.</li>
            <li>Scraping, copying, or republishing content from Roomio without permission.</li>
            <li>
              Using the platform to advertise illegal activities or content that violates Lithuanian
              or EU law.
            </li>
            <li>Posting listings for properties you do not have the right to sublease.</li>
          </ul>
        </Section>

        <Section title="6. User-generated content">
          <p>
            You retain ownership of photos and descriptions you upload. By posting content on
            Roomio, you grant us a non-exclusive, royalty-free, worldwide licence to display and
            distribute that content as part of operating the platform.
          </p>
          <p>
            We may remove any content that violates these terms or applicable law, without prior
            notice.
          </p>
        </Section>

        <Section title="7. No guarantee of transactions">
          <p>
            Roomio is a marketplace only. We do not verify the physical condition of listed
            properties and we are not a party to any rental agreement between users. Any agreement
            you reach with another user is solely between the two of you.
          </p>
          <p>
            Always view a property in person before paying any money. Never transfer money to
            someone you have not met.
          </p>
        </Section>

        <Section title="8. Limitation of liability">
          <p>
            To the fullest extent permitted by law, Roomio and its operators are not liable for:
          </p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>Any loss arising from transactions between users.</li>
            <li>Inaccurate listing information provided by other users.</li>
            <li>Temporary unavailability of the platform.</li>
            <li>
              Indirect, incidental, or consequential damages arising from your use of the site.
            </li>
          </ul>
          <p>
            Nothing in these terms limits liability for fraud, personal injury, or any liability
            that cannot be excluded by law.
          </p>
        </Section>

        <Section title="9. Intellectual property">
          <p>
            The Roomio name, logo, and all platform code are owned by us. You may not use them
            without prior written consent.
          </p>
        </Section>

        <Section title="10. Privacy">
          <p>
            Your use of the platform is subject to our{" "}
            <Link to="/privacy-policy" className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            , which forms part of these terms.
          </p>
        </Section>

        <Section title="11. Changes to these terms">
          <p>
            We may update these terms at any time. We will notify registered users by email at
            least 14 days before material changes take effect. Continued use of the platform after
            changes take effect constitutes acceptance.
          </p>
        </Section>

        <Section title="12. Governing law">
          <p>
            These terms are governed by the law of the{" "}
            <strong className="text-foreground">Republic of Lithuania</strong>. Any disputes shall
            be resolved in the courts of Vilnius, Lithuania, unless mandatory EU consumer law
            provides otherwise.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            Questions about these terms?{" "}
            <a href="mailto:hello@roomio.lt" className="underline hover:text-foreground transition-colors">
              hello@roomio.lt
            </a>
          </p>
        </Section>
      </div>
    </div>

    <Footer />
  </div>
);

export default TermsOfServicePage;
