import "../styles/globals.css";
import { useRouter } from "next/router";
import FallingElements from "../components/FallingElements";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith("/admin");
  return (
    <>
      {!isAdmin && <FallingElements />}
      <Component {...pageProps} />
    </>
  );
}
