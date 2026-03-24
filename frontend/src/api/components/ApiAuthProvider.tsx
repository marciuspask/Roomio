import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { setTokenGetter } from "@/api/http/auth";
import "@/api/http/interceptor";

export default function ApiAuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);

  return <>{children}</>;
}
