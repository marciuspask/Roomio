import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Home, ShieldCheck, Users } from "lucide-react";

const AboutPage = () => (
  <div className="min-h-screen bg-background">
    <Nav />

    {/* Hero */}
    <section className="border-b border-border px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-heading text-4xl font-extrabold text-foreground sm:text-5xl">
          About Roomi<span className="text-primary">o</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          A platform built in Lithuania, for Lithuania — connecting people who need a place to stay
          with people who have a room to share.
        </p>
      </div>
    </section>

    {/* Mission */}
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-heading text-2xl font-bold text-foreground">Our mission</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Finding a flatmate or a shared room in Lithuania can be stressful — listings scattered
          across Facebook groups, no way to verify who you're talking to, and too many scams.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Roomio was built to fix that. We verify every user with a real phone number, keep listings
          honest, and give both landlords and tenants a single, safe place to connect.
        </p>
      </div>
    </section>

    {/* Values */}
    <section className="border-t border-border px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-10 font-heading text-2xl font-bold text-foreground">What we stand for</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: <ShieldCheck className="h-6 w-6" />,
              title: "Safety first",
              desc: "Every user must verify their phone number before sending messages. No anonymous contacts, no throwaway accounts.",
            },
            {
              icon: <Home className="h-6 w-6" />,
              title: "Honest listings",
              desc: "Real photos, real prices, real availability. We review reports promptly and remove anything that doesn't meet our standards.",
            },
            {
              icon: <Users className="h-6 w-6" />,
              title: "Community-driven",
              desc: "Built by and for people in Lithuania. Your feedback shapes every feature we ship.",
            },
          ].map((v) => (
            <div key={v.title} className="rounded-xl border border-border bg-card p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF3EE] text-primary">
                {v.icon}
              </div>
              <h3 className="mb-2 font-heading text-base font-bold text-foreground">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Contact */}
    <section className="border-t border-border px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-heading text-2xl font-bold text-foreground">Get in touch</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Have a question, a feature suggestion, or want to report a problem? We'd love to hear from you.
        </p>
        <div className="mt-6 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground space-y-2">
          <p>
            <span className="font-medium text-foreground">Email:</span>{" "}
            <a href="mailto:hello@roomio.lt" className="underline hover:text-foreground transition-colors">
              hello@roomio.lt
            </a>
          </p>
          <p>
            <span className="font-medium text-foreground">Location:</span> Vilnius, Lithuania
          </p>
        </div>
        <div className="mt-8 flex gap-3">
          <Link
            to="/listings"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors"
          >
            Browse rooms
          </Link>
          <Link
            to="/listings/create"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-elevated transition-colors"
          >
            Post a room
          </Link>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default AboutPage;
