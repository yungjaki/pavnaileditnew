import "../styles/globals.css";
import "flatpickr/dist/flatpickr.min.css";
import { useRouter } from "next/router";
import Head from "next/head";
import FallingElements from "../components/FallingElements";
import SplashScreen from "../components/SplashScreen";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith("/admin");
  // The splash only greets people on the home page — never in the middle of booking.
  const showSplash = router.pathname === "/";
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/favicon-192.png" />
        <meta name="theme-color" content="#f8b7d1" />
      </Head>
      <a href="#main-content" className="sr-only skip-link">Към съдържанието</a>
      {showSplash && <SplashScreen />}
      {!isAdmin && <FallingElements />}
      <div id="main-content">
        <Component {...pageProps} />
      </div>
    </>
  );
}
