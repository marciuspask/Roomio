import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Roomi<span className="text-primary">o</span>
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{t.footer.tagline}</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">{t.footer.product}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/listings" className="hover:text-foreground transition-colors">{t.footer.browse}</Link></li>
              <li><Link to="/listings/create" className="hover:text-foreground transition-colors">{t.footer.postRoom}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">{t.footer.company}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">{t.footer.about}</Link></li>
              <li><a href="mailto:hello@roomio.lt" className="hover:text-foreground transition-colors">{t.footer.contact}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">{t.footer.legal}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy-policy" className="hover:text-foreground transition-colors">{t.footer.privacyPolicy}</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-foreground transition-colors">{t.footer.termsOfService}</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-foreground transition-colors">{t.footer.cookiePolicy}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
