import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";

interface Announcement {
  message_en: string;
  message_lt: string;
  link_text_en: string;
  link_text_lt: string;
  link_url: string;
  active: boolean;
}

export default function AnnouncementBanner() {
  const { lang } = useLanguage();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/announcement.json")
      .then(r => r.json())
      .then((data: Announcement) => {
        if (data.active) setAnnouncement(data);
      })
      .catch(() => {});
  }, []);

  const message = announcement ? (lang === "lt" ? announcement.message_lt : announcement.message_en) : "";
  const linkText = announcement ? (lang === "lt" ? announcement.link_text_lt : announcement.link_text_en) : "";

  const [displayed, setDisplayed] = useState("");
  const [linkVisible, setLinkVisible] = useState(false);

  useEffect(() => {
    if (!announcement) return;
    setDisplayed("");
    setLinkVisible(false);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(message.slice(0, i + 1));
      i++;
      if (i >= message.length) {
        clearInterval(interval);
        setLinkVisible(true);
      }
    }, 35);
    return () => clearInterval(interval);
  }, [announcement, lang]);

  if (!announcement || dismissed) return null;

  return (
    <div
      style={{ backgroundColor: "#D85A30" }}
      className="relative flex items-center justify-center px-10 py-2.5"
    >
      <p style={{ fontSize: 14, fontWeight: 500, color: "#FAECE7" }}>
        {displayed}{" "}
        <Link
          to={announcement.link_url}
          style={{
            fontSize: 13,
            color: "#F5C4B3",
            textDecoration: "underline",
            opacity: linkVisible ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          {linkText}
        </Link>
      </p>
      <button
        onClick={() => setDismissed(true)}
        style={{ color: "#F5C4B3" }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
