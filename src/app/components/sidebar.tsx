"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  LifeBuoy,
  LogOut,
  Search,
  Settings,
  SlidersHorizontal,
  StickyNote,
  UserPlus,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Info,
  Sparkles,
  HelpCircle,
  PlayCircle,
} from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import LottiePlayer from "./LottiePlayer";
import { supabase } from "../../../lib/superbaseClient";
import {
  PERSONALIZATION_UPDATED_EVENT,
  getUserPersonalization,
} from "../services/personalizationService";
import { clearClientSession, getVerifiedAuthUser, persistClientSession } from "@/lib/clientAuth";
import {
  sanitizePersonalizationTopic,
  slugifyPersonalizationTopic,
} from "@/lib/personalizationTopics";

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isDesktopCollapsed?: boolean;
  onToggleDesktop?: () => void;
}

type CategoryNavItem = {
  topic: string;
  href: string;
  iconName: IconName;
};

const CATEGORY_NAV_ITEMS: CategoryNavItem[] = [
  { topic: "Top Headlines", href: "/", iconName: "home" },
  { topic: "Technology", href: "/categories/technology", iconName: "laptop" },
  { topic: "Business", href: "/categories/business", iconName: "briefcase" },
  { topic: "Entertainment", href: "/categories/entertainment", iconName: "film" },
  { topic: "Sports", href: "/categories/sports", iconName: "trophy" },
  { topic: "Health", href: "/categories/health", iconName: "heart" },
  { topic: "Science", href: "/categories/science", iconName: "flask-conical" },
  { topic: "Politics", href: "/categories/politics", iconName: "landmark" },
  { topic: "Tourism", href: "/categories/tourism", iconName: "plane" },
  { topic: "Crime", href: "/categories/crime", iconName: "shield-alert" },
  { topic: "Environment", href: "/categories/environment", iconName: "leaf" },
  { topic: "Education", href: "/categories/education", iconName: "graduation-cap" },
  { topic: "Travel", href: "/categories/travel", iconName: "map" },
  { topic: "Food", href: "/categories/food", iconName: "utensils-crossed" },
  { topic: "Fashion", href: "/categories/fashion", iconName: "shirt" },
  { topic: "Finance", href: "/categories/finance", iconName: "wallet" },
  { topic: "Automotive", href: "/categories/automotive", iconName: "car" },
  { topic: "Music", href: "/categories/music", iconName: "music-2" },
  { topic: "Movies", href: "/categories/movies", iconName: "clapperboard" },
  { topic: "Books", href: "/categories/books", iconName: "book-open" },
  { topic: "Art", href: "/categories/art", iconName: "palette" },
  { topic: "Culture", href: "/categories/culture", iconName: "palette" },
  { topic: "Gaming", href: "/categories/gaming", iconName: "gamepad-2" },
  {
    topic: "Spirituality & Religion",
    href: "/categories/spirituality-religion",
    iconName: "gem",
  },
  { topic: "Mental Health", href: "/categories/mental-health", iconName: "heart" },
  {
    topic: "Artificial Intelligence",
    href: "/categories/artificial-intelligence",
    iconName: "bot",
  },
  { topic: "Cybersecurity", href: "/categories/cybersecurity", iconName: "shield-alert" },
  { topic: "Space & Astronomy", href: "/categories/space-astronomy", iconName: "telescope" },
  { topic: "Stock Market", href: "/categories/stock-market", iconName: "chart-candlestick" },
  { topic: "Trade & Economy", href: "/categories/trade-economy", iconName: "trending-up" },
  { topic: "Real Estate", href: "/categories/real-estate", iconName: "building-2" },
  { topic: "Defense & Military", href: "/categories/defense-military", iconName: "shield" },
  {
    topic: "Agriculture & Farming",
    href: "/categories/agriculture-farming",
    iconName: "sprout",
  },
  { topic: "World News", href: "/categories/world-news", iconName: "globe-2" },
  { topic: "Weather", href: "/categories/weather", iconName: "cloud-sun" },
  { topic: "Energy", href: "/categories/energy", iconName: "zap" },
  { topic: "Startups", href: "/categories/startups", iconName: "rocket" },
  { topic: "Law & Justice", href: "/categories/law-justice", iconName: "scale" },
  { topic: "Social Media", href: "/categories/social-media", iconName: "share-2" },
  {
    topic: "Personal Finance",
    href: "/categories/personal-finance",
    iconName: "piggy-bank",
  },
];

const INDIAN_TADKA_SOURCES = [
  { name: "NDTV", id: "ndtv", href: "/news/indian-tadka/ndtv", icon: "/indianTadka/NDTV.jpg" },
  { name: "Times of India", id: "times-of-india", href: "/news/indian-tadka/times-of-india", icon: "/indianTadka/timesofIndia.jpg" },
  { name: "Hindustan Times", id: "hindustan-times", href: "/news/indian-tadka/hindustan-times", icon: "/indianTadka/hindustanTimes.jpg" },
  { name: "Indian Express", id: "indian-express", href: "/news/indian-tadka/indian-express", icon: "/indianTadka/indianExpress.jpg" },
  { name: "The Hindu", id: "the-hindu", href: "/news/indian-tadka/the-hindu", icon: "/indianTadka/theHindu.jpg" },
];

const CATEGORY_NAV_BY_TOPIC = new Map(
  CATEGORY_NAV_ITEMS.map((item) => [item.topic.toLowerCase(), item]),
);

function SidebarIcon({
  name,
  size = 18,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <DynamicIcon
      name={name}
      size={size}
      className={className}
      fallback={() => null}
    />
  );
}

const TOPIC_ICON_RULES: Array<[RegExp, IconName]> = [
  [/\b(ai|artificial intelligence|machine learning|generative|llm|chatbot|robot|automation)\b/, "bot"],
  [/\b(chip|semiconductor|processor|cpu|gpu|hardware|quantum|device)\b/, "cpu"],
  [/\b(neural|brain|cognitive|mental health|psychology|therapy)\b/, "brain-circuit"],
  [/\b(cyber|cybersecurity|hack|hacker|ransomware|malware|phishing|breach|password|privacy|encryption)\b/, "lock-keyhole"],
  [/\b(bug|vulnerability|zero-day|exploit|patch)\b/, "bug"],
  [/\b(software|app|apps|platform|internet|cloud|database|data|server|saas|code|developer)\b/, "database"],
  [/\b(phone|smartphone|mobile|ios|android|telecom|5g|network)\b/, "smartphone"],
  [/\b(startup|startups|founder|venture|funding|ipo|entrepreneur)\b/, "rocket"],
  [/\b(election|vote|voting|poll|campaign|ballot|democrat|republican)\b/, "vote"],
  [/\b(politic|government|parliament|congress|senate|policy|minister|president|diplomacy)\b/, "landmark"],
  [/\b(court|law|justice|legal|judge|lawsuit|trial|ruling)\b/, "gavel"],
  [/\b(war|defense|military|army|navy|air force|missile|weapon|border|conflict|troop)\b/, "shield"],
  [/\b(crime|police|arrest|fraud|murder|homicide|theft)\b/, "siren"],
  [/\b(health|medical|medicine|doctor|hospital|patient|disease|virus|vaccine|covid|flu|wellness)\b/, "stethoscope"],
  [/\b(biotech|biology|genetic|dna|pharma|drug|clinical)\b/, "dna"],
  [/\b(science|research|lab|physics|chemistry|discovery|experiment)\b/, "atom"],
  [/\b(space|astronomy|nasa|satellite|moon|mars|rocket|planet)\b/, "telescope"],
  [/\b(stock|stocks|market|trading|wall street|invest|investment|shares|equity)\b/, "chart-candlestick"],
  [/\b(economy|inflation|gdp|recession|growth|trade|export|import|tariff)\b/, "trending-up"],
  [/\b(finance|bank|money|tax|loan|mortgage|credit|debt|retirement|savings)\b/, "banknote"],
  [/\b(crypto|bitcoin|blockchain|ethereum|web3|token)\b/, "bitcoin"],
  [/\b(real estate|housing|property|rent|home price|mortgage)\b/, "building-2"],
  [/\b(business|company|corporate|earnings|retail|consumer|brand|industry)\b/, "briefcase"],
  [/\b(energy|oil|gas|fuel|petrol|diesel|electricity|power grid)\b/, "fuel"],
  [/\b(solar|wind|renewable|battery|ev charging)\b/, "solar-panel"],
  [/\b(weather|storm|rain|heatwave|temperature|forecast|snow)\b/, "thermometer"],
  [/\b(climate|environment|pollution|forest|wildfire|carbon)\b/, "tree-pine"],
  [/\b(flood|ocean|sea|water|hurricane|cyclone|tsunami)\b/, "waves"],
  [/\b(fire|wildfire|heat|volcano)\b/, "flame"],
  [/\b(farm|farming|agriculture|crop|wheat|rice|livestock|irrigation|food security)\b/, "wheat"],
  [/\b(food|restaurant|recipe|chef|cuisine|nutrition)\b/, "chef-hat"],
  [/\b(travel|tourism|tourist|hotel|airline|visa|destination)\b/, "plane"],
  [/\b(car|auto|automotive|vehicle|ev|tesla|transport)\b/, "car"],
  [/\b(train|rail|metro|subway)\b/, "train"],
  [/\b(bus|transit|public transport)\b/, "bus"],
  [/\b(ship|shipping|port|supply chain|cargo|freight|logistics)\b/, "ship"],
  [/\b(truck|delivery|warehouse)\b/, "truck"],
  [/\b(movie|film|cinema|box office|actor|director)\b/, "clapperboard"],
  [/\b(music|album|song|singer|concert|band)\b/, "music-2"],
  [/\b(tv|television|streaming|netflix|series|show)\b/, "tv"],
  [/\b(celebrity|entertainment|influencer|creator)\b/, "camera"],
  [/\b(social media|tiktok|instagram|youtube|x|twitter|facebook)\b/, "share-2"],
  [/\b(media|press|journalism|headline|news)\b/, "newspaper"],
  [/\b(book|author|publishing|literature|novel)\b/, "book-marked"],
  [/\b(art|artist|gallery|museum|painting|design)\b/, "palette"],
  [/\b(fashion|style|clothing|designer|runway)\b/, "shirt"],
  [/\b(game|gaming|esports|console|playstation|xbox)\b/, "gamepad-2"],
  [/\b(sport|sports|cricket|football|soccer|tennis|basketball|nba|nfl|olympic)\b/, "trophy"],
  [/\b(school|education|university|college|student|exam)\b/, "graduation-cap"],
  [/\b(religion|faith|spirituality|church|temple|mosque)\b/, "gem"],
  [/\b(shopping|commerce|ecommerce|store|consumer)\b/, "shopping-cart"],
  [/\b(community|society|people|labor|workers|migration)\b/, "users"],
  [/\b(world|global|international|geopolitics|foreign)\b/, "globe-2"],
  [/\b(live|breaking|alert|urgent)\b/, "activity"],
  [/\b(factory|manufacturing|industrial|supply)\b/, "factory"],
  [/\b(public|announcement|campaign|communication)\b/, "megaphone"],
  [/\b(chart|analytics|trend|statistics|data)\b/, "chart-line"],
];

function getDynamicTopicIcon(topic: string): IconName {
  const normalized = topic.toLowerCase();

  for (const [pattern, iconName] of TOPIC_ICON_RULES) {
    if (pattern.test(normalized)) return iconName;
  }

  return "newspaper";
}

const DEFAULT_TOPIC_SELECTION = [
  "top headlines",
  "technology",
  "business",
  "entertainment",
  "sports",
  "health",
  "science",
];

const SIDEBAR_SEARCH_EVENT = "sidebar-search";

export default function Sidebar({ isMobileOpen, onCloseMobile, isDesktopCollapsed, onToggleDesktop }: SidebarProps) {
  const [query, setQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isPersonalizationLoaded, setIsPersonalizationLoaded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const loadPersonalization = async () => {
      setIsPersonalizationLoaded(false);
      try {
        const { data } = await getUserPersonalization();
        setSelectedTopics(
          Array.isArray(data?.favorite_topics) ? data.favorite_topics : [],
        );
      } catch {
        setSelectedTopics([]);
      } finally {
        setIsPersonalizationLoaded(true);
      }
    };

    getVerifiedAuthUser()
      .then(async ({ user }) => {
        if (user) {
          try {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            setIsAuthenticated(true);
            setUserEmail(user.email ?? "");
            persistClientSession(user.email ?? "", session?.access_token ?? "");
            void loadPersonalization();
          } catch (err: unknown) {
            const errorName =
              err instanceof Error
                ? err.name
                : typeof err === "object" &&
                    err !== null &&
                    "name" in err &&
                    typeof (err as { name?: unknown }).name === "string"
                  ? (err as { name: string }).name
                  : "";
            if (errorName === "AbortError") {
              console.warn("Sidebar auth operation timed out (expected behavior).");
            }
          }
        } else {
          setIsAuthenticated(false);
          setUserEmail("");
          setSelectedTopics([]);
          setIsPersonalizationLoaded(true);
        }
      })
      .catch((err) => {
        if (err?.name === "AbortError") {
          console.warn("Sidebar auth operation timed out (expected behavior).");
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;

      if (nextUser) {
        setIsAuthenticated(true);
        setUserEmail(nextUser.email ?? "");
        persistClientSession(nextUser.email ?? "", session?.access_token ?? "");
        void loadPersonalization();
      } else {
        setIsAuthenticated(false);
        setUserEmail("");
        setSelectedTopics([]);
        setIsPersonalizationLoaded(true);
        clearClientSession();
      }
    });

    const handlePersonalizationUpdated = () => {
      void loadPersonalization();
    };
    window.addEventListener(
      PERSONALIZATION_UPDATED_EVENT,
      handlePersonalizationUpdated,
    );

    return () => {
      subscription.unsubscribe();
      window.removeEventListener(
        PERSONALIZATION_UPDATED_EVENT,
        handlePersonalizationUpdated,
      );
    };
  }, []);

  useEffect(() => {
    if (isMobileOpen) onCloseMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const runSearch = useCallback(
    (nextQuery: string) => {
      const trimmed = nextQuery.trim();
      if (!trimmed) return;
      setQuery(trimmed);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      onCloseMobile();
    },
    [onCloseMobile, router],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  useEffect(() => {
    const handleSidebarSearch = (event: Event) => {
      const detail = (event as CustomEvent<{ query?: string }>).detail;
      if (!detail?.query) return;
      runSearch(detail.query);
    };

    window.addEventListener(SIDEBAR_SEARCH_EVENT, handleSidebarSearch);
    return () => {
      window.removeEventListener(SIDEBAR_SEARCH_EVENT, handleSidebarSearch);
    };
  }, [runSearch]);

  const desktopContent = (
    <SidebarContent
      query={query}
      setQuery={setQuery}
      handleSearch={handleSearch}
      pathname={pathname}
      onCloseMobile={onCloseMobile}
      isAuthenticated={isAuthenticated}
      userEmail={userEmail}
      selectedTopics={selectedTopics}
      isPersonalizationLoaded={isPersonalizationLoaded}
      router={router}
      isDesktopCollapsed={isDesktopCollapsed}
      onToggleDesktop={onToggleDesktop}
      isMobile={false}
    />
  );

  const mobileContent = (
    <SidebarContent
      query={query}
      setQuery={setQuery}
      handleSearch={handleSearch}
      pathname={pathname}
      onCloseMobile={onCloseMobile}
      isAuthenticated={isAuthenticated}
      userEmail={userEmail}
      selectedTopics={selectedTopics}
      isPersonalizationLoaded={isPersonalizationLoaded}
      router={router}
      isDesktopCollapsed={false}
      isMobile={true}
    />
  );

  return (
    <>
      <aside className={`hidden md:flex fixed left-0 top-[65px] h-[calc(100vh-65px)] ${isDesktopCollapsed ? "w-20" : "w-72"} transition-[width] duration-300 bg-white/95 backdrop-blur border-r border-slate-200/80 shadow-sm flex-col dark:bg-slate-900/95 dark:border-slate-700/80`}>
        {desktopContent}
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.button
              aria-label="Close sidebar overlay"
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl md:hidden flex flex-col"
              style={{ backgroundColor: "var(--card)" }}
            >
              {mobileContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({
  query,
  setQuery,
  handleSearch,
  pathname,
  onCloseMobile,
  isAuthenticated,
  userEmail,
  selectedTopics,
  isPersonalizationLoaded,
  router,
  isDesktopCollapsed,
  onToggleDesktop,
  isMobile,
}: {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: (e: React.FormEvent) => void;
  pathname: string;
  onCloseMobile: () => void;
  isAuthenticated: boolean;
  userEmail: string;
  selectedTopics: string[];
  isPersonalizationLoaded: boolean;
  router: ReturnType<typeof useRouter>;
  isDesktopCollapsed?: boolean;
  onToggleDesktop?: () => void;
  isMobile?: boolean;
}) {
  const closeAndNavigate = () => onCloseMobile();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchClick = () => {
    if (isDesktopCollapsed && onToggleDesktop) {
      onToggleDesktop();
    }
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
  };
  const navItemClass = (active: boolean) =>
    `group flex items-center ${isDesktopCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "gap-3 px-4 py-2"} rounded-xl transition text-sm font-medium ${
      active
        ? "bg-[var(--card)] text-[var(--primary)] border border-[var(--primary)]"
        : "text-gray-700 hover:bg-gray-100 hover:text-[var(--primary)] dark:text-slate-300 dark:hover:bg-slate-800"
    }`;

  const selectedTopicLabels = selectedTopics
    .map((topic) => sanitizePersonalizationTopic(topic))
    .filter(Boolean);
  const selectedTopicSet = new Set(
    selectedTopicLabels.map((topic) => topic.toLowerCase()),
  );
  const effectiveTopicSet = new Set<string>();
  effectiveTopicSet.add("top headlines");

  if (isAuthenticated) {
    if (selectedTopicSet.size > 0) {
      for (const topic of selectedTopicSet) effectiveTopicSet.add(topic);
    } else {
      for (const topic of DEFAULT_TOPIC_SELECTION) effectiveTopicSet.add(topic);
    }
  } else {
    for (const topic of DEFAULT_TOPIC_SELECTION) effectiveTopicSet.add(topic);
  }

  const visibleCategoryItems = CATEGORY_NAV_ITEMS.filter((item) =>
    effectiveTopicSet.has(item.topic.toLowerCase()),
  );
  const customCategoryItems: CategoryNavItem[] = [];
  const customTopicSet = new Set<string>();

  for (const topic of selectedTopicLabels) {
    const topicKey = topic.toLowerCase();
    if (
      CATEGORY_NAV_BY_TOPIC.has(topicKey) ||
      customTopicSet.has(topicKey) ||
      !effectiveTopicSet.has(topicKey)
    ) {
      continue;
    }

    customTopicSet.add(topicKey);
    customCategoryItems.push({
      topic,
      href: `/categories/${slugifyPersonalizationTopic(topic)}`,
      iconName: getDynamicTopicIcon(topic),
    });
  }

  const visibleNavigationItems = [
    ...visibleCategoryItems,
    ...customCategoryItems,
  ];
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      clearClientSession(userEmail);
      onCloseMobile();
      router.replace("/");
    }
  };

  return (
    <>
      <div className={`flex-1 overflow-y-auto ${isDesktopCollapsed ? "p-3 overflow-x-hidden" : "p-6"}`}>
        <div className={`flex items-center ${isDesktopCollapsed ? "flex-col gap-4" : "gap-3"} mb-8`}>
          {/* Header Action Row */}
          {!isMobile && isDesktopCollapsed && onToggleDesktop && (
            <button
              onClick={onToggleDesktop}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Expand Sidebar"
            >
              <PanelLeftOpen size={20} />
            </button>
          )}

          {isMobile ? (
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 600, damping: 12, bounce: 0.4, duration: 0.4 }}
              className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent cursor-default overflow-hidden whitespace-nowrap"
            >
              DailyScoop
            </motion.h2>
          ) : (
            <>
              {!isDesktopCollapsed ? (
                <div className="flex-1">
                  <form onSubmit={handleSearch} className="relative group">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 group-focus-within:text-indigo-700 transition-colors"
                      size={18}
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search news..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full rounded-xl border-2 border-indigo-100 bg-indigo-50/40 py-2.5 pl-10 pr-10 text-sm font-semibold text-slate-800 placeholder:text-indigo-400/60 transition-all duration-300 hover:bg-indigo-50/60 hover:border-indigo-200 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-slate-100 dark:placeholder:text-indigo-700/50 dark:focus:bg-slate-900"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </form>
                </div>
              ) : (
                <button
                  onClick={handleSearchClick}
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 hover:bg-slate-100 text-indigo-600 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700"
                  title="Search"
                >
                  <Search size={20} />
                </button>
              )}
            </>
          )}

          {!isMobile && !isDesktopCollapsed && onToggleDesktop && (
            <button
              onClick={onToggleDesktop}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto"
              title="Collapse Sidebar"
            >
              <PanelLeftClose size={20} />
            </button>
          )}
        </div>

        {isMobile && (
          <div className="relative mb-6">
            <form onSubmit={handleSearch} className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 group-focus-within:text-indigo-700 transition-colors"
                size={18}
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search news..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border-2 border-indigo-100 bg-indigo-50/40 py-2.5 pl-10 pr-10 text-sm font-semibold text-slate-800 placeholder:text-indigo-400/60 transition-all duration-300 hover:bg-indigo-50/60 hover:border-indigo-200 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-slate-100 dark:placeholder:text-indigo-700/50 dark:focus:bg-slate-900"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </form>
          </div>
        )}

        <nav className="space-y-2">
          <CollapsibleSection
            title="Streamings"
            isDesktopCollapsed={isDesktopCollapsed}
            icon={
              <LottiePlayer
                src="/indianTadka/play button animation.json"
                className="w-6 h-6 -ml-1"
              />
            }
          >
            <div className="space-y-1">
              <Link
                href="/live-news"
                className={`flex items-center ${isDesktopCollapsed ? "justify-center w-12 h-12 mx-auto" : "gap-3 px-4 py-2"} rounded-xl text-sm font-medium transition ${
                  pathname.startsWith("/live-news")
                    ? "bg-[var(--card)] text-[var(--primary)] border border-[var(--primary)]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[var(--primary)] dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
                onClick={closeAndNavigate}
                title={isDesktopCollapsed ? "News Streaming" : undefined}
              >
                <SidebarIcon
                  name="radio"
                  size={isDesktopCollapsed ? 18 : 14}
                  className="shrink-0 text-red-500"
                />
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"}`}
                >
                  News Streaming
                </span>
                {!isDesktopCollapsed && (
                  <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    LIVE
                  </span>
                )}
              </Link>
              <Link
                href="/shorts"
                className={`flex items-center ${isDesktopCollapsed ? "justify-center w-12 h-12 mx-auto" : "gap-3 px-4 py-2"} rounded-xl text-sm font-medium transition ${
                  pathname.startsWith("/shorts")
                    ? "bg-[var(--card)] text-[var(--primary)] border border-[var(--primary)]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[var(--primary)] dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
                onClick={closeAndNavigate}
                title={isDesktopCollapsed ? "Shorts" : undefined}
              >
                <PlayCircle
                  size={isDesktopCollapsed ? 18 : 14}
                  className="shrink-0 text-purple-500"
                />
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"}`}
                >
                  Shorts
                </span>
              </Link>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title={
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 bg-clip-text text-transparent font-bold">
                Indian Tadka
              </span>
            }
            isDesktopCollapsed={isDesktopCollapsed}
            icon={
              <LottiePlayer
                src="/indianTadka/fire.json"
                className="w-6 h-6 -ml-1"
              />
            }
          >
            <div className="space-y-1">
              {INDIAN_TADKA_SOURCES.map((source) => (
                <Link
                  key={source.id}
                  href={source.href}
                  className={`flex items-center ${isDesktopCollapsed ? "justify-center w-12 h-12 mx-auto" : "gap-3 px-4 py-2"} rounded-xl text-sm font-medium transition ${
                    pathname === source.href
                      ? "bg-[var(--card)] text-[var(--primary)] border border-[var(--primary)]"
                      : "text-gray-600 hover:bg-gray-100 hover:text-[var(--primary)] dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                  onClick={closeAndNavigate}
                  title={isDesktopCollapsed ? source.name : undefined}
                >
                  <img
                    src={source.icon}
                    alt={source.name}
                    className={`shrink-0 rounded-md object-cover border border-slate-200 dark:border-slate-700 ${isDesktopCollapsed ? "w-6 h-6" : "w-5 h-5"}`}
                  />
                  <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"}`}>
                    {source.name}
                  </span>
                </Link>
              ))}
            </div>
          </CollapsibleSection>
          {visibleNavigationItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.topic}
                href={item.href}
                className={navItemClass(isActive)}
                onClick={closeAndNavigate}
                title={isDesktopCollapsed ? item.topic : undefined}
              >
                <SidebarIcon
                  name={item.iconName}
                  size={18}
                  className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shrink-0"
                />
                <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"}`}>
                  {item.topic}
                </span>
              </Link>
            );
          })}
          <div className={`overflow-hidden transition-all duration-300 ${isDesktopCollapsed ? "max-h-0 opacity-0" : "max-h-20 opacity-100"}`}>
            {isAuthenticated &&
              isPersonalizationLoaded &&
              visibleNavigationItems.length === 0 && (
                <p className="px-4 py-2 text-xs text-slate-500">
                  No topics selected. Add topics in Personalization.
                </p>
              )}
          </div>
          {isAuthenticated && (
            <div className="relative md:hidden my-2">
              {/* Animated border */}
              <div
                className={`
                  absolute -inset-px rounded-xl
                  ${
                    pathname === "/notes"
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }
                  transition-opacity duration-300
                  overflow-hidden
                `}
              >
                <span className="absolute inset-[-100%] bg-[conic-gradient(from_90deg_at_50%_50%,#e2e8f0_0%,#9333ea_50%,#e2e8f0_100%)] animate-[spin_4s_linear_infinite]" />
              </div>

              {/* Inner button */}
              <Link
                href="/notes"
                onClick={closeAndNavigate}
                className="relative group z-10 flex items-center gap-3 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-800 border border-transparent hover:text-indigo-700 transition-colors duration-300 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-indigo-400"
              >
                <StickyNote
                  size={18}
                  className="text-purple-600 group-hover:text-purple-700 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                />
                <span>Notes</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Collapsible Sections */}
        <div className={`overflow-hidden transition-all duration-300 ${isDesktopCollapsed ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"}`}>
          {isAuthenticated && (
            <CollapsibleSection
              title="Extra Options"
              isDesktopCollapsed={isDesktopCollapsed}
              icon={<Sparkles size={16} className="text-amber-500" />}
            >
              <Link
                href="/personalization"
                className={`inline-flex items-center ${isDesktopCollapsed ? "justify-center w-12 h-12 mx-auto" : "gap-3 px-4 py-1.5"} text-sm text-slate-600 hover:text-[var(--primary)] cursor-pointer transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800`}
                onClick={closeAndNavigate}
                title={isDesktopCollapsed ? "Personalization" : undefined}
              >
              <SlidersHorizontal className="shrink-0" size={isDesktopCollapsed ? 18 : 14} />
              <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"}`}>
                  Personalization
                </span>
              </Link>
              <Link
                href="/appearance"
                className={`inline-flex items-center ${isDesktopCollapsed ? "justify-center w-12 h-12 mx-auto" : "gap-3 px-4 py-1.5"} text-sm text-slate-600 hover:text-[var(--primary)] cursor-pointer transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800`}
                onClick={closeAndNavigate}
                title={isDesktopCollapsed ? "Appearance" : undefined}
              >
              <SidebarIcon className="shrink-0" name="palette" size={isDesktopCollapsed ? 18 : 14} />
              <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"}`}>
                  Appearance
                </span>
              </Link>
              <Link
                href="/plans"
                className={`inline-flex items-center ${isDesktopCollapsed ? "justify-center w-12 h-12 mx-auto" : "gap-3 px-4 py-1.5"} text-sm text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors rounded-xl hover:bg-slate-100 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800`}
                onClick={closeAndNavigate}
                title={isDesktopCollapsed ? "Subscriptions" : undefined}
              >
              <SidebarIcon className="shrink-0" name="gem" size={isDesktopCollapsed ? 18 : 14} />
              <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"}`}>
                  Subscriptions
                </span>
              </Link>
            </CollapsibleSection>
          )}

          <CollapsibleSection
            title="More Info"
            isDesktopCollapsed={isDesktopCollapsed}
            icon={<HelpCircle size={16} className="text-blue-500" />}
          >
            <Link
              href="/about"
              className={`inline-flex items-center ${isDesktopCollapsed ? "justify-center w-12 h-12 mx-auto" : "gap-3 px-4 py-1.5"} text-sm text-slate-600 transition-colors hover:text-[var(--primary)] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800`}
              onClick={closeAndNavigate}
              title={isDesktopCollapsed ? "About NextNews" : undefined}
            >
            <SidebarIcon className="shrink-0" name="info" size={isDesktopCollapsed ? 18 : 14} />
            <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"}`}>
                About NextNews
              </span>
            </Link>
            <Link
              href="/support"
              className={`inline-flex items-center ${isDesktopCollapsed ? "justify-center w-12 h-12 mx-auto" : "gap-3 px-4 py-1.5"} text-sm text-slate-600 hover:text-[var(--primary)] cursor-pointer transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800`}
              onClick={closeAndNavigate}
              title={isDesktopCollapsed ? "Contact Support" : undefined}
            >
            <LifeBuoy className="shrink-0" size={isDesktopCollapsed ? 18 : 14} />
            <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"}`}>
                Contact Support
              </span>
            </Link>
            <Link
              href="/privacy-policy"
              className={`inline-flex items-center ${isDesktopCollapsed ? "justify-center w-12 h-12 mx-auto" : "gap-3 px-4 py-1.5"} text-sm text-slate-600 hover:text-[var(--primary)] cursor-pointer transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800`}
              onClick={closeAndNavigate}
              title={isDesktopCollapsed ? "Privacy Policy" : undefined}
            >
            <SidebarIcon className="shrink-0" name="shield" size={isDesktopCollapsed ? 18 : 14} />
            <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"}`}>
                Privacy Policy
              </span>
            </Link>
          </CollapsibleSection>
        </div>
      </div>

      <div className={`p-4 border-t border-[var(--border)] ${isDesktopCollapsed ? "flex justify-center p-3" : ""}`}>
        {isAuthenticated ? (
          <div className={`relative ${isDesktopCollapsed ? "" : "w-full"}`}>
            <button
              onClick={() => {
                if (isDesktopCollapsed) {
                  onToggleDesktop?.();
                  setUserMenuOpen(true);
                } else {
                  setUserMenuOpen(!userMenuOpen);
                }
              }}
              className={`flex items-center ${isDesktopCollapsed ? "justify-center" : "gap-3 px-2 w-full"} py-2 rounded-xl hover:bg-slate-50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] dark:hover:bg-slate-800`}
              title={isDesktopCollapsed ? `Signed in as ${userEmail}` : undefined}
            >
              <img
                src={
                  userEmail
                    ? `https://ui-avatars.com/api/?name=${userEmail}&background=random`
                    : `https://ui-avatars.com/api/?name=User&background=random`
                }
                alt="User Avatar"
                width={36}
                height={36}
                className="w-9 h-9 rounded-full border-2 border-slate-200 shrink-0"
              />
              <div className={`flex items-center overflow-hidden transition-all duration-300 ${isDesktopCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100 flex-1 min-w-0"}`}>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm text-slate-700 block truncate dark:text-slate-200">
                    {userEmail}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-slate-500 transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {userMenuOpen && !isDesktopCollapsed && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
                <div className="px-4 py-2 text-sm text-slate-500 border-b">
                  Signed in as <br />
                  <strong className="text-slate-800 truncate block">
                    {userEmail}
                  </strong>
                </div>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  onClick={closeAndNavigate}
                >
                  <Settings size={16} className="text-slate-500" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <LogOut size={16} className="text-red-500" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/auth/register"
            onClick={closeAndNavigate}
            className={`flex w-full items-center justify-center ${isDesktopCollapsed ? "px-0" : "gap-2 px-4"} rounded-xl border border-[var(--primary)] bg-transparent py-2 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10`}
            title={isDesktopCollapsed ? "Create Account" : undefined}
          >
            <UserPlus size={isDesktopCollapsed ? 20 : 16} />
            {!isDesktopCollapsed && <span>Create Account</span>}
          </Link>
        )}
      </div>
    </>
  );
}

function CollapsibleSection({
  title,
  children,
  isDesktopCollapsed,
  icon,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  isDesktopCollapsed?: boolean;
  icon?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2">
      <div className={`overflow-hidden transition-all duration-300 ${isDesktopCollapsed ? "max-h-0 opacity-0" : "max-h-12 opacity-100"}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group ${
            isOpen 
              ? "bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-200/50 dark:bg-slate-800/50 dark:text-slate-100 dark:ring-slate-700/50" 
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {icon && <div className="shrink-0 flex items-center justify-center">{icon}</div>}
            <span className="whitespace-nowrap truncate">{title}</span>
          </div>
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : "opacity-60 group-hover:opacity-100"}`}
          />
        </button>
      </div>
      <AnimatePresence>
        {isOpen && !isDesktopCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={`space-y-1 ${isDesktopCollapsed ? "py-1" : "py-1"}`}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
