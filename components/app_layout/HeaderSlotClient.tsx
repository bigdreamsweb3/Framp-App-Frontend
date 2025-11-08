"use client";
import { useEffect } from "react";

export default function HeaderSlotClient() {
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 56) document.body.classList.add("scrolled");
      else document.body.classList.remove("scrolled");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="header-slot"></div>
  );
}
