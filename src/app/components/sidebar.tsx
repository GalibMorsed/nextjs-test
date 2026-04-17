"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
} from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
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

export default function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
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

  const navItemClass = (active: boolean) =>
    `group flex items-center gap-3 px-4 py-2 rounded-xl transition text-sm font-medium ${
      active
        ? "bg-[var(--card)] text-[var(--primary)] border border-[var(--primary)]"
        : "text-gray-700 hover:bg-gray-100 hover:text-[var(--primary)]"
    }`;

  const content = (
    <SidebarContent
      query={query}
      setQuery={setQuery}
      handleSearch={handleSearch}
      pathname={pathname}
      navItemClass={navItemClass}
      onCloseMobile={onCloseMobile}
      isAuthenticated={isAuthenticated}
      userEmail={userEmail}
      selectedTopics={selectedTopics}
      isPersonalizationLoaded={isPersonalizationLoaded}
      router={router}
    />
  );

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-[65px] h-[calc(100vh-65px)] w-72 bg-white/95 backdrop-blur border-r border-slate-200/80 shadow-sm flex-col dark:bg-slate-900/95 dark:border-slate-700/80">
        {content}
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
              {content}
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
  navItemClass,
  onCloseMobile,
  isAuthenticated,
  userEmail,
  selectedTopics,
  isPersonalizationLoaded,
  router,
}: {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: (e: React.FormEvent) => void;
  pathname: string;
  navItemClass: (active: boolean) => string;
  onCloseMobile: () => void;
  isAuthenticated: boolean;
  userEmail: string;
  selectedTopics: string[];
  isPersonalizationLoaded: boolean;
  router: ReturnType<typeof useRouter>;
}) {
  const closeAndNavigate = () => onCloseMobile();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
      <div className="p-6 flex-1 overflow-y-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-3xl font-black mb-6 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent cursor-default"
        >
          DailyScoop
        </motion.h2>

        <form onSubmit={handleSearch} className="mb-6 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-300"
            size={18}
          />
          <input
            type="text"
            placeholder="Search news..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-100 py-2 pl-10 pr-10 text-sm text-gray-800 placeholder:text-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-300 dark:focus:border-[var(--primary)] dark:focus:bg-slate-700"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </form>

        <nav className="space-y-2">
          <Link
            href="/live-news"
            className={navItemClass(pathname.startsWith("/live-news"))}
            onClick={closeAndNavigate}
          >
            <SidebarIcon
              name="radio"
              size={18}
              className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
            />
            Live News Streaming
          </Link>
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
              >
                <SidebarIcon
                  name={item.iconName}
                  size={18}
                  className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                />
                {item.topic}
              </Link>
            );
          })}
          {isAuthenticated &&
            isPersonalizationLoaded &&
            visibleNavigationItems.length === 0 && (
              <p className="px-4 py-2 text-xs text-slate-500">
                No topics selected. Add topics in Personalization.
              </p>
            )}
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
        {isAuthenticated && (
          <CollapsibleSection title="Extra Options">
            <Link
              href="/personalization"
              className="inline-flex items-center gap-2 px-4 py-1 text-sm text-slate-600 hover:text-[var(--primary)] cursor-pointer transition-colors"
              onClick={closeAndNavigate}
            >
              <SlidersHorizontal size={14} />
              Personalization
            </Link>
            <Link
              href="/appearance"
              className="inline-flex items-center gap-2 px-4 py-1 text-sm text-slate-600 hover:text-[var(--primary)] cursor-pointer transition-colors"
              onClick={closeAndNavigate}
            >
              <SidebarIcon name="palette" size={14} />
              Appearance
            </Link>
            <Link
              href="/plans"
              className="inline-flex items-center gap-2 px-4 py-1 text-sm text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors dark:text-slate-400 dark:hover:text-indigo-400"
              onClick={closeAndNavigate}
            >
              <SidebarIcon name="gem" size={14} />
              Subscriptions
            </Link>
          </CollapsibleSection>
        )}

        <CollapsibleSection title="More Info">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-4 py-1 text-sm text-slate-600 transition-colors hover:text-[var(--primary)]"
            onClick={closeAndNavigate}
          >
            <SidebarIcon name="info" size={14} />
            About NextNews
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center gap-2 px-4 py-1 text-sm text-slate-600 hover:text-[var(--primary)] cursor-pointer transition-colors"
            onClick={closeAndNavigate}
          >
            <LifeBuoy size={14} />
            Contact Support
          </Link>
          <Link
            href="/privacy-policy"
            className="inline-flex items-center gap-2 px-4 py-1 text-sm text-slate-600 hover:text-[var(--primary)] cursor-pointer transition-colors"
            onClick={closeAndNavigate}
          >
            <SidebarIcon name="shield" size={14} />
            Privacy Policy
          </Link>
        </CollapsibleSection>
      </div>

      <div className="p-4 border-t border-[var(--border)]">
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 w-full px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
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
                className="w-9 h-9 rounded-full border-2 border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm text-slate-700 block truncate">
                  {userEmail}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-500 transition-transform duration-200 ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {userMenuOpen && (
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
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--primary)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10"
          >
            <UserPlus size={16} />
            <span>Create Account</span>
          </Link>
        )}
      </div>
    </>
  );
}

function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition"
      >
        {title}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="py-1 space-y-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
