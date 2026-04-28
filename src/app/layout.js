import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CookieBanner from "@/components/CookieBanner";
import { ToastProvider } from "@/components/Toast/toast.context";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body style={{display: "flex", flexDirection: "column", minHeight: "100vh"}} suppressHydrationWarning>
        {/* Background element inserted to ensure global background is visible */}
        <div className="site-bg" aria-hidden="true" />
        <ToastProvider>
          <Header />
          <main className="appMain">
            {children}
          </main>
          <Footer /> {/* ✅ Footer global */}
          <CookieBanner />
        </ToastProvider>
  {/* Paw parallax elements removed — global background now handled in globals.css */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                const body = document.body;
                let scrollTimeout;

                function showScrollbar() {
                  body.classList.add('scrolling');
                  clearTimeout(scrollTimeout);
                  scrollTimeout = setTimeout(() => {
                    body.classList.remove('scrolling');
                  }, 1000); // Hide after 1 second of no scrolling
                }

                window.addEventListener('scroll', showScrollbar);

                // Parallax for paws
                const paws = document.querySelectorAll('.paw');
                window.addEventListener('scroll', function() {
                  const scrollY = window.scrollY;
                  paws.forEach((paw, index) => {
                    const speed = (index + 1) * 0.5;
                    paw.style.transform = \`translateY(\${scrollY * speed}px)\`;
                  });
                });
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
