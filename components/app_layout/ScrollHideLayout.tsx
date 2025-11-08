// components/ScrollHideLayout.tsx
import { useEffect, useState } from "react";

interface ScrollHideLayoutProps {
  children: React.ReactNode;
}

export default function ScrollHideLayout({ children }: ScrollHideLayoutProps) {
  const [hideContent, setHideContent] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHideContent(true);
      } else {
        setHideContent(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main
      className={`transition-opacity duration-300 ${
        hideContent ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {children}
    </main>
  );
}
