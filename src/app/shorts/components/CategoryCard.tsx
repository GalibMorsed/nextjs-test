"use client";

import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  gradient: string;
  onClick: () => void;
}

export default function CategoryCard({
  name,
  icon: Icon,
  gradient,
  onClick,
}: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex min-h-[180px] w-full flex-col justify-between overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-[#1a1f3d] dark:hover:border-white/20 dark:hover:bg-[#23294d] sm:min-h-[220px] sm:rounded-[32px] sm:p-8"
    >
      {/* Icon Section */}
      <div className="relative z-10">
        <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br ${gradient} text-white shadow-xl shadow-black/5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 sm:h-16 sm:w-16 sm:rounded-[22px]`}>
          <Icon className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2} />
        </div>
      </div>

      {/* Label Section */}
      <div className="relative z-10 text-left">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {name}
        </h3>
        <p className="mt-1 hidden text-xs font-medium text-slate-400 opacity-0 transition-all duration-500 group-hover:opacity-100 dark:text-slate-400 sm:block sm:text-sm">
          Tap to view reels
        </p>
      </div>

      {/* Minimal background depth effects */}
      <div className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${gradient} opacity-0 blur-[80px] transition-opacity duration-700 group-hover:opacity-20`} />
      
      {/* Subtle border highlight on hover */}
      <div className="absolute inset-0 border-2 border-transparent transition-colors duration-500 group-hover:border-white/5" />
      
      {/* Corner Accent */}
      <div className={`absolute bottom-0 right-0 h-12 w-12 translate-x-6 translate-y-6 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-xl transition-transform duration-700 group-hover:scale-150`} />
    </button>
  );
}
