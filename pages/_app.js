import "../styles/globals.css";
import { useRouter } from "next/router";
import Head from "next/head";
import FallingElements from "../components/FallingElements";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith("/admin");
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/favicon-192.png" />
        <meta name="theme-color" content="#f8b7d1" />
      </Head>
      {!isAdmin && <FallingElements />}
      <Component {...pageProps} />
    </>
  );
}