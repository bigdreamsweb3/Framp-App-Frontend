"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
// import Link from 'next/link';
// import Image from 'next/image';

interface NavbarProps {
  activeView: string
  onChangeView: (view: string) => void
}

const navItems = [
  { icon: "/img/home.svg", icon2: "/img/homeact.svg", label: 'Home', view: 'onramp' },
  { icon: "/img/act.svg", icon2: "/img/actact.svg", label: 'Activity', view: 'activity' },
  // { icon: "/img/hist.svg", icon2: "/img/histact.svg", label: 'History', view: 'history' },
  { icon: "/img/prof.svg", icon2: "/img/profact.svg", label: 'Profile', view: 'profile' }
]

const BottomNavbar = ({ activeView, onChangeView }: NavbarProps) => {
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null; // Prevent hydration mismatch

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-card/80 border-t border-gray-200 dark:border-gray-900 px-0 py-3 transition-colors z-50">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const active = activeView === item.view
          return (
            <button
              key={item.label}
              onClick={() => onChangeView(item.view)}
              className="flex flex-col items-center gap-1 transition-colors focus:outline-none w-full"
              aria-pressed={active}
            >
              <img
                src={active ? item.icon2 : item.icon}
                alt={item.label}
                width={29}
                height={29}
                className="h-[29px] w-auto"
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNavbar