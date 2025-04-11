"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./theme-toggle";

export default function NavBar() {
  const pathname = usePathname();
  
  return (
    <div className="top-nav container border-b border-border">
      <div></div> {/* Empty div to maintain flexbox spacing */}
      <div className="flex space-x-4">
        <Link 
          href="/" 
          className="nav-link text-foreground"
        >
          home
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
} 