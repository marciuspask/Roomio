import { ReactNode } from "react";

const EmptyState = ({ icon, title, description, cta }: {
  icon: ReactNode;
  title: string;
  description: string;
  cta?: ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 text-muted-foreground">{icon}</div>
    <h3 className="mb-2 font-heading text-lg font-bold text-foreground">{title}</h3>
    <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
    {cta}
  </div>
);
export default EmptyState;
