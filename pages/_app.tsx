// pages/_app.tsx
import "../styles/globals.css";   // ← this path must match

import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function MyApp({ Component, pageProps }: AppProps) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      else setUserId(null);
    };
    getUser();
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => getUser());
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  return (
    <Component {...pageProps} />
  );
}
