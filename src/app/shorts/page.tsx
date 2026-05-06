"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { 
  Zap,
  Globe,
  Gavel,
  Briefcase,
  Leaf,
  TrendingUp,
  Cpu,
  GraduationCap,
  Trophy,
  FlaskConical,
  HeartPulse,
  Lock
} from "lucide-react";
import CategoryCard from "./components/CategoryCard";
import ReelsOverlay from "./components/ReelsOverlay";
import { loadUserSubscriptionPlan } from "@/app/services/subscriptionPlanService";

const GUEST_CATEGORY_LIMIT = 4;

const hasLocalAuth = () => {
  if (typeof window === "undefined") return false;
  const authToken = localStorage.getItem("auth_token")?.trim();
  const authEmail = localStorage.getItem("auth_email")?.trim();
  return Boolean(authToken || authEmail);
};

const hasActivePlanAccess = () => {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("nextnews-plan")?.trim());
};

const categories = [
  { 
    id: "top-stories", 
    name: "Top Stories", 
    icon: Zap, 
    gradient: "from-amber-400 to-orange-600" 
  },
  { 
    id: "world", 
    name: "World", 
    icon: Globe, 
    gradient: "from-blue-500 to-cyan-600" 
  },
  { 
    id: "politics", 
    name: "Politics", 
    icon: Gavel, 
    gradient: "from-rose-600 to-red-700" 
  },
  { 
    id: "business", 
    name: "Business", 
    icon: Briefcase, 
    gradient: "from-slate-700 to-slate-900" 
  },
  { 
    id: "climate", 
    name: "Climate", 
    icon: Leaf, 
    gradient: "from-emerald-500 to-teal-700" 
  },
  { 
    id: "economy", 
    name: "Economy", 
    icon: TrendingUp, 
    gradient: "from-indigo-600 to-violet-700" 
  },
  { 
    id: "technology", 
    name: "Technology", 
    icon: Cpu, 
    gradient: "from-cyan-500 to-blue-600" 
  },
  { 
    id: "education", 
    name: "Education", 
    icon: GraduationCap, 
    gradient: "from-sky-400 to-blue-500" 
  },
  { 
    id: "sports", 
    name: "Sports", 
    icon: Trophy, 
    gradient: "from-orange-500 to-red-600" 
  },
  { 
    id: "science", 
    name: "Science", 
    icon: FlaskConical, 
    gradient: "from-indigo-500 to-purple-600" 
  },
  { 
    id: "health", 
    name: "Health", 
    icon: HeartPulse, 
    gradient: "from-emerald-500 to-teal-600" 
  },
];

export default function ShortsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasActivePlan, setHasActivePlan] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncAccessState = async () => {
      const authenticated = hasLocalAuth();
      let activePlanAccess = hasActivePlanAccess();

      if (!activePlanAccess && authenticated) {
        const { data } = await loadUserSubscriptionPlan().catch(() => ({
          data: null,
        }));
        activePlanAccess = data?.status === "active";
      }

      if (!isMounted) return;

      setIsAuthenticated(authenticated);
      setHasActivePlan(activePlanAccess);
    };

    void syncAccessState();
    window.addEventListener("storage", syncAccessState);
    window.addEventListener("focus", syncAccessState);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", syncAccessState);
      window.removeEventListener("focus", syncAccessState);
    };
  }, []);

  const visibleCategories = useMemo(
    () => (isAuthenticated ? categories : categories.slice(0, GUEST_CATEGORY_LIMIT)),
    [isAuthenticated]
  );

  const hiddenCount = categories.length - visibleCategories.length;

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-12 md:px-12 md:py-16">
      {/* Header section */}
      <div className="mb-12 max-w-2xl animate-fade-up">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-5xl">
          NextNews{" "}
          <span
            style={{ fontFamily: "cursive" }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 font-medium italic drop-shadow-sm"
          >
            Shorts
          </span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Get your daily dose of news in byte-sized video formats. Select a category to start your reels experience.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 animate-fade-in [animation-delay:200ms]">
        {visibleCategories.map((category) => (
          <CategoryCard
            key={category.id}
            name={category.name}
            icon={category.icon}
            gradient={category.gradient}
            onClick={() => setSelectedCategory(category.id)}
          />
        ))}
      </div>

      {!isAuthenticated && hiddenCount > 0 && (
        <div className="mx-auto mt-12 max-w-3xl animate-fade-up [animation-delay:400ms]">
          <div className="rounded-3xl border border-blue-100 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/40 p-8 text-center shadow-sm backdrop-blur-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-md ring-1 ring-blue-100 dark:ring-white/10 transition-transform hover:scale-110">
              <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Unlock {hiddenCount} More News Channels
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
              Register or Sign in to access more features. Joining NextNews unlocks all {categories.length} news categories and allows you to enjoy a personalized Shorts experience for free.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 hover:shadow-blue-500/40 active:scale-95"
              >
                Sign Up to Unlock
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Reels Full-Screen Overlay */}
      {selectedCategory && (
        <ReelsOverlay
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}
