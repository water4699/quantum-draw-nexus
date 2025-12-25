"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", label: "Register", icon: "📝" },
  { path: "/draw", label: "Draw", icon: "🎲" },
  { path: "/participants", label: "Participants", icon: "👥" },
];

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 shadow-lg backdrop-blur">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link key={item.path} href={item.path}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer",
                isActive
                  ? "bg-gradient-to-r from-sky-400/20 via-indigo-500/20 to-purple-500/20 text-white shadow-lg"
                  : "text-slate-300/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
};

