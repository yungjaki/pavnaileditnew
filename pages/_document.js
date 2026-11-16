import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="bg">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@400;500;600;700&display=swap"
        />
        <meta property="og:site_name" content="PavNailedIt" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="bg_BG" />
        <meta name="twitter:card" content="summary_large_image" />
        {/* Hide the hero's animated parts until GSAP takes over (avoids a flash).
            Skipped for reduced motion; a timeout reveals everything if JS never runs. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){var d=document.documentElement;d.classList.add('motion-ok');setTimeout(function(){d.classList.add('motion-done')},4000)}}catch(e){}})();",
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
