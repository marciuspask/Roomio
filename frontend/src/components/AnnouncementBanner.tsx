import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Announcement {
  message: string;
  link_text: string;
  link_url: string;
  active: boolean;
}

const DISMISSED_KEY = "dismissed_announcement";

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === "1",
  );

  useEffect(() => {
    fetch("/announcement.json")
      .then(r => r.json())
      .then((data: Announcement) => {
        if (data.active) setAnnouncement(data);
      })
      .catch(() => {});
  }, []);

  const [displayed, setDisplayed] = useState("");
  const [linkVisible, setLinkVisible] = useState(false);

  useEffect(() => {
    if (!announcement) return;
    setDisplayed("");
    setLinkVisible(false);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(announcement.message.slice(0, i + 1));
      i++;
      if (i >= announcement.message.length) {
        clearInterval(interval);
        setLinkVisible(true);
      }
    }, 35);
    return () => clearInterval(interval);
  }, [announcement]);

  if (!announcement || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  };

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
          {announcement.link_text}
        </Link>
      </p>
      <button
        onClick={handleDismiss}
        style={{ color: "#F5C4B3" }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
