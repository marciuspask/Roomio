import { useLanguage } from "@/lib/i18n";

const TypeBadge = ({ type }: { type: "offering" | "seeking" }) => {
  const { t } = useLanguage();
  if (type === "offering") {
    return (
      <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary-dark">
        {t.browse.roomOffered}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-warning/30 bg-warning-bg px-2.5 py-0.5 text-xs font-medium text-warning">
      {t.browse.lookingForRoom}
    </span>
  );
};
export default TypeBadge;
