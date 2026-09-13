"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/analysis", label: "New Analysis" },
  { href: "/library", label: "My Lifter Library" },
  { href: "/reports", label: "Saved Reports" },
  { href: "/reference", label: "Reference Data" },
];

export default function NavTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 flex-wrap">
      {TABS.map((t) => {
        const active = pathname?.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-md border-b-[3px] ${
              active ? "border-red-600 text-blue-900" : "border-transparent text-slate-500 hover:text-blue-900 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
