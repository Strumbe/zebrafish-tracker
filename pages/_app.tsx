// pages/_app.tsx
import "../styles/globals.css";   // ← this path must match

import type { AppProps } from "next/app";

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
