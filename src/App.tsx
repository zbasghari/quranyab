import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Search, BookOpen, Star, Copy, Check, ChevronDown, Sparkles, X } from "lucide-react";
import { quranData, categories, type Ayah } from "./data/quranData";

// Suggested search tags
const suggestedTags = [
  "صبر", "توکل", "آرامش", "رحمت", "امید",
  "عدالت", "توبه", "نماز", "علم", "شکر",
  "تقوا", "دنیا", "ایمان", "گناه", "دعا",
];

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-emerald-400/30 text-white rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function AyahCard({
  ayah,
  query,
  index,
}: {
  ayah: Ayah;
  query: string;
  index: number;
}) {
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleCopy = useCallback(() => {
    const text = `${ayah.ar}\n\n${ayah.fa}\n\nسوره ${ayah.surah} - آیه ${ayah.ayah}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [ayah]);

  const staggerClass = `stagger-${Math.min(index + 1, 10)}`;

  return (
    <div
      className={`glass-card animate-fade-in-up opacity-0 ${staggerClass} bg-white/[0.08] backdrop-blur-xl border border-white/[0.15] rounded-2xl p-5 sm:p-6 mb-4 group relative overflow-hidden`}
    >
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />

      {/* Header with surah info */}
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-emerald-400 text-sm font-semibold font-vazir">
              سوره {ayah.surah}
            </span>
            <span className="text-white/50 text-xs block font-vazir">
              آیه {ayah.ayah}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="نشان‌گذاری"
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                isBookmarked
                  ? "text-amber-400 fill-amber-400"
                  : "text-white/40 hover:text-amber-400"
              }`}
            />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="کپی آیه"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-white/40 hover:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Arabic text */}
      <p className="text-xl sm:text-2xl leading-loose text-white mb-4 font-amiri text-right" dir="rtl">
        {ayah.ar}
      </p>

      {/* Separator */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/20 to-transparent" />
        <span className="text-emerald-400/60 text-xs">✦</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Persian translation */}
      <p className="text-white/80 leading-relaxed mb-4 font-vazir text-sm sm:text-base">
        <HighlightText text={ayah.fa} query={query} />
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-3">
        {ayah.tags.map((tag) => (
          <span
            key={tag}
            className="tag-chip text-[11px] px-2.5 py-1 rounded-full bg-white/[0.08] text-white/60 border border-white/[0.1] font-vazir cursor-default"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function CategoryPills({
  activeCategory,
  onSelect,
}: {
  activeCategory: string;
  onSelect: (cat: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative mb-5">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`category-btn flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-vazir whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "active bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-white/[0.06] border-white/[0.1] text-white/60 hover:text-white/80 hover:bg-white/[0.1]"
            }`}
          >
            <span className="text-base">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    let filtered = quranData;

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter((v) => v.category === activeCategory);
    }

    // Filter by search query
    if (query.trim()) {
      const q = query.trim();
      filtered = filtered.filter(
        (v) =>
          v.tags.some((t) => t.includes(q)) ||
          v.fa.includes(q) ||
          v.ar.includes(q) ||
          v.surah.includes(q)
      );
    }

    return filtered;
  }, [query, activeCategory]);

  const handleSearch = useCallback((searchTerm: string) => {
    setQuery(searchTerm);
    setHasSearched(true);
    setShowSuggestions(false);
  }, []);

  const handleCategorySelect = useCallback((cat: string) => {
    setActiveCategory(cat);
    setHasSearched(true);
  }, []);

  const handleClear = useCallback(() => {
    setQuery("");
    setActiveCategory("all");
    setHasSearched(false);
    inputRef.current?.focus();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const showResults = hasSearched || activeCategory !== "all";
  const totalAyahs = quranData.length;

  return (
    <div
      className="min-h-screen font-vazir"
      dir="rtl"
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/16354017/pexels-photo-16354017.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1920')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 z-0" />

      {/* Decorative elements */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 z-50" />

      {/* Main content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-10 animate-fade-in">
          {/* Logo icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-5 animate-pulse-glow">
            <span className="text-3xl sm:text-4xl">📖</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 font-vazir tracking-tight">
            قرآن‌یاب معنوی
          </h1>
          <p className="text-white/60 text-sm sm:text-base font-vazir max-w-md mx-auto leading-relaxed">
            جستجوی هوشمند آیات قرآن بر اساس مفاهیم و کلمات کلیدی
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-5">
            <div className="flex items-center gap-1.5 text-white/40 text-xs font-vazir">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{totalAyahs} آیه</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-1.5 text-white/40 text-xs font-vazir">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>{categories.length - 1} دسته‌بندی</span>
            </div>
          </div>
        </header>

        {/* Search box */}
        <div className="search-container relative mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value.trim()) setHasSearched(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch(query);
                }}
                placeholder="جستجوی مفهوم، کلمه یا سوره..."
                className="w-full py-3.5 sm:py-4 pr-12 pl-10 bg-white/[0.08] backdrop-blur-xl border border-white/[0.15] rounded-xl text-white placeholder-white/40 outline-none focus:border-emerald-500/50 focus:bg-white/[0.12] transition-all text-sm sm:text-base font-vazir"
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/50" />
                </button>
              )}
            </div>
            <button
              onClick={() => handleSearch(query)}
              className="px-5 sm:px-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-vazir text-sm sm:text-base transition-all hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.97] flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">جستجو</span>
            </button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && !query && (
            <div className="absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-xl border border-white/[0.15] rounded-xl p-4 z-20 animate-slide-down">
              <p className="text-white/40 text-xs mb-3 font-vazir flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                پیشنهاد جستجو
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleSearch(tag)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-white/[0.08] text-white/70 border border-white/[0.1] hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-300 transition-all font-vazir"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category pills */}
        <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <CategoryPills
            activeCategory={activeCategory}
            onSelect={handleCategorySelect}
          />
        </div>

        {/* Results */}
        {showResults ? (
          <div>
            {/* Results count */}
            <div className="flex items-center justify-between mb-4 animate-fade-in">
              <p className="text-white/50 text-sm font-vazir">
                {results.length > 0 ? (
                  <>
                    <span className="text-emerald-400 font-semibold">
                      {results.length}
                    </span>{" "}
                    آیه یافت شد
                  </>
                ) : (
                  "نتیجه‌ای یافت نشد"
                )}
              </p>
              {(query || activeCategory !== "all") && (
                <button
                  onClick={handleClear}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors font-vazir flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  پاک کردن فیلتر
                </button>
              )}
            </div>

            {/* Ayah cards */}
            {results.length > 0 ? (
              <div>
                {results.map((ayah, i) => (
                  <AyahCard
                    key={`${ayah.surahNumber}-${ayah.ayah}`}
                    ayah={ayah}
                    query={query}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.06] mb-4">
                  <Search className="w-7 h-7 text-white/30" />
                </div>
                <p className="text-white/50 font-vazir text-sm mb-2">
                  نتیجه‌ای برای جستجوی شما یافت نشد
                </p>
                <p className="text-white/30 font-vazir text-xs">
                  لطفاً کلمه دیگری را امتحان کنید
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Welcome / Initial state */
          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {/* Featured ayah */}
            <div className="relative bg-gradient-to-br from-emerald-500/[0.12] to-transparent backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 sm:p-8 mb-6 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-5">
                <div className="absolute top-4 left-4 w-32 h-32 border border-white/20 rounded-full" />
                <div className="absolute bottom-4 right-4 w-24 h-24 border border-white/20 rounded-full" />
              </div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-vazir">آیه برگزیده</span>
                </div>
                <p className="text-xl sm:text-2xl text-white leading-loose mb-4 font-amiri">
                  أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-emerald-500/30 to-transparent" />
                  <span className="text-emerald-400/50 text-xs">✦</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                </div>
                <p className="text-white/70 font-vazir text-sm sm:text-base leading-relaxed">
                  آگاه باشید! تنها با یاد خدا دل‌ها آرامش می‌یابد.
                </p>
                <p className="text-emerald-400/60 text-xs mt-3 font-vazir">
                  سوره رعد - آیه ۲۸
                </p>
              </div>
            </div>

            {/* Quick access grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.slice(1, 7).map((cat, i) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`animate-fade-in-up opacity-0 stagger-${i + 1} glass-card flex flex-col items-center gap-2 p-4 sm:p-5 bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-xl text-center hover:bg-white/[0.12] transition-all`}
                >
                  <span className="text-2xl sm:text-3xl">{cat.icon}</span>
                  <span className="text-white/70 text-xs sm:text-sm font-vazir">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>

            {/* More categories hint */}
            <div className="text-center mt-6">
              <div className="flex items-center justify-center gap-2 text-white/30 text-xs font-vazir">
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
                <span>از دسته‌بندی‌های بالا یا جستجو استفاده کنید</span>
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-white/[0.08] text-center animate-fade-in">
          <p className="text-white/25 text-[11px] font-vazir leading-relaxed">
            قرآن‌یاب معنوی — جستجوی مفهومی آیات قرآن کریم
          </p>
        </footer>
      </div>
    </div>
  );
}
