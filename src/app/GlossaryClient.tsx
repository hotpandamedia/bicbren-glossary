"use client";

import { useState, useMemo, useEffect } from "react";

/* ─── Types ─── */
type RecentItem = {
  section: string;
  name: string;
  summary: string;
  dateAdded: string;
};

type GlossaryData = {
  meta: {
    title: string;
    tagline: string;
    description: string;
    lastUpdated: string;
    safetyLegend: Record<string, string>;
  };
  recentlyAdded: RecentItem[];
  terms: { term: string; category: string; definition: string; example: string }[];
  commands: {
    command: string;
    category: string;
    safety: string;
    what: string;
    when: string;
    example: string;
  }[];
  stack: {
    tool: string;
    category: string;
    what: string;
    why: string;
    analogy: string;
  }[];
  safePractices: {
    title: string;
    category: string;
    rule: string;
    why: string;
    how: string;
    realStory: string;
  }[];
  fileTypes: {
    extension: string;
    name: string;
    what: string;
    you_see_it: string;
    can_edit: boolean | string;
    note: string;
  }[];
  symbols: {
    symbol: string;
    name: string;
    what: string;
    example: string;
  }[];
  faqs: {
    question: string;
    answer: string;
    solution: string;
    related: string[];
  }[];
  troubleshooting: {
    problem: string;
    likely_cause: string;
    steps: string[];
    severity: string;
  }[];
};

/* ─── Constants ─── */
const SECTIONS = [
  { id: "terms", label: "TERMS", number: "01", color: "blue" },
  { id: "commands", label: "COMMANDS", number: "02", color: "gold" },
  { id: "stack", label: "YOUR STACK", number: "03", color: "blue" },
  { id: "safety", label: "SAFE PRACTICES", number: "04", color: "gold" },
  { id: "files", label: "FILE TYPES", number: "05", color: "blue" },
  { id: "symbols", label: "SYMBOLS", number: "06", color: "gold" },
  { id: "faqs", label: "FAQs", number: "07", color: "blue" },
  { id: "troubleshooting", label: "TROUBLESHOOTING", number: "08", color: "gold" },
] as const;

const headline = "var(--font-barlow-condensed), 'Barlow Condensed', sans-serif";
const label = "var(--font-inter), Inter, sans-serif";

type SortDir = "asc" | "desc";

/* ─── Small Components ─── */

function SafetyBadge({ level }: { level: string }) {
  const cls =
    level === "safe"
      ? "safety-safe"
      : level === "caution"
        ? "safety-caution"
        : "safety-dangerous";
  return (
    <span
      className={`${cls} inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-[#1a1a1a]`}
      style={{ fontFamily: label }}
    >
      {level}
    </span>
  );
}

function SeverityDot({ severity }: { severity: string }) {
  return (
    <span
      className={`w-3 h-3 rounded-full flex-shrink-0 ${
        severity === "common" ? "bg-[#F2B84B]" : "bg-[#4d7cf5]"
      }`}
    />
  );
}

function SectionHeader({
  number,
  title,
  color,
  id,
}: {
  number: string;
  title: string;
  color: "blue" | "gold";
  id: string;
}) {
  const accent = color === "blue" ? "#4d7cf5" : "#F2B84B";
  return (
    <div id={id} className="flex items-start gap-4 md:gap-6 mb-6 md:mb-8">
      <span
        className="text-5xl md:text-7xl font-black leading-none select-none"
        style={{ fontFamily: headline, color: accent }}
      >
        {number}
      </span>
      <h2
        className="text-3xl md:text-5xl font-black uppercase pb-2 flex-1"
        style={{ fontFamily: headline, borderBottom: `4px solid ${accent}` }}
      >
        {title}
      </h2>
    </div>
  );
}

function Legend({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-4 p-4 md:p-6 border-4 border-[#1a1a1a] bg-white mb-6">
      <span className="text-sm font-bold uppercase mr-2" style={{ fontFamily: label }}>
        Legend:
      </span>
      {children}
    </div>
  );
}

function SortBar({
  options,
  current,
  direction,
  onSort,
  filterOptions,
  currentFilter,
  onFilter,
}: {
  options: { key: string; label: string }[];
  current: string;
  direction: SortDir;
  onSort: (key: string) => void;
  filterOptions?: { key: string; label: string }[];
  currentFilter?: string;
  onFilter?: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs font-bold uppercase text-[#1a1a1a]/40 mr-1" style={{ fontFamily: label }}>
        Sort:
      </span>
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onSort(o.key)}
          className={`px-2 py-1 text-xs font-bold uppercase tracking-wider border-2 border-[#1a1a1a] transition-all ${
            current === o.key
              ? "bg-[#4d7cf5] text-white"
              : "bg-white text-[#1a1a1a] hover:bg-[#4d7cf5] hover:text-white"
          }`}
          style={{ fontFamily: label }}
        >
          {o.label} {current === o.key ? (direction === "asc" ? "↑" : "↓") : ""}
        </button>
      ))}
      {filterOptions && onFilter && (
        <>
          <span className="text-xs font-bold uppercase text-[#1a1a1a]/40 ml-4 mr-1" style={{ fontFamily: label }}>
            Filter:
          </span>
          <button
            onClick={() => onFilter("all")}
            className={`px-2 py-1 text-xs font-bold uppercase tracking-wider border-2 border-[#1a1a1a] transition-all ${
              currentFilter === "all"
                ? "bg-[#1a1a1a] text-[#fcf9f8]"
                : "bg-white text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#fcf9f8]"
            }`}
            style={{ fontFamily: label }}
          >
            ALL
          </button>
          {filterOptions.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilter(f.key)}
              className={`px-2 py-1 text-xs font-bold uppercase tracking-wider border-2 border-[#1a1a1a] transition-all ${
                currentFilter === f.key
                  ? "bg-[#1a1a1a] text-[#fcf9f8]"
                  : "bg-white text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#fcf9f8]"
              }`}
              style={{ fontFamily: label }}
            >
              {f.label}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

function CollapsibleCard({
  id,
  title,
  accentColor = "#4d7cf5",
  rightLabel,
  badges,
  children,
}: {
  id?: string;
  title: string;
  accentColor?: string;
  rightLabel?: React.ReactNode;
  badges?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const isGold = accentColor === "#F2B84B" || accentColor === "#1a1a1a";
  const bgColor = isGold ? "#F2B84B" : "#4d7cf5";
  const textColor = isGold ? "#1a1a1a" : "#ffffff";
  return (
    <div id={id} className="border-4 border-[#1a1a1a] bg-white brutalist-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 md:px-6 py-4 flex items-center justify-between text-left"
        style={{ background: bgColor, borderBottom: open ? `4px solid ${bgColor}` : "none" }}
      >
        <div className="flex items-center gap-3 pr-4 min-w-0">
          {badges}
          <h3
            className="text-lg md:text-2xl font-black uppercase truncate"
            style={{ fontFamily: headline, color: textColor }}
          >
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {rightLabel}
          <span
            className="text-2xl font-black"
            style={{ fontFamily: headline, color: textColor }}
          >
            {open ? "−" : "+"}
          </span>
        </div>
      </button>
      {open && <div className="p-4 md:p-6">{children}</div>}
    </div>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#4d7cf5] text-white border-4 border-[#1a1a1a] brutalist-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-[#F2B84B] hover:text-[#1a1a1a] transition-all flex items-center justify-center"
      aria-label="Back to top"
    >
      <span className="text-2xl font-black" style={{ fontFamily: headline }}>↑</span>
    </button>
  );
}

/* ─── Helpers ─── */
function slug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function unique<T>(arr: T[], fn: (item: T) => string): string[] {
  return [...new Set(arr.map(fn))].sort();
}

const SAFETY_ORDER: Record<string, number> = { safe: 0, caution: 1, dangerous: 2 };

function sortItems<T>(items: T[], key: string, dir: SortDir): T[] {
  return [...items].sort((a, b) => {
    const av = String((a as Record<string, unknown>)[key] ?? "").toLowerCase();
    const bv = String((b as Record<string, unknown>)[key] ?? "").toLowerCase();
    if (key === "safety") {
      const diff = (SAFETY_ORDER[av] ?? 9) - (SAFETY_ORDER[bv] ?? 9);
      return dir === "asc" ? diff : -diff;
    }
    return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });
}

/* ─── Main Component ─── */
export function GlossaryClient({ data }: { data: GlossaryData }) {
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Sort states
  const [termSort, setTermSort] = useState("term");
  const [termSortDir, setTermSortDir] = useState<SortDir>("asc");
  const [termFilter, setTermFilter] = useState("all");

  const [cmdSort, setCmdSort] = useState("command");
  const [cmdSortDir, setCmdSortDir] = useState<SortDir>("asc");
  const [cmdSafetyFilter, setCmdSafetyFilter] = useState("all");

  const [stackSort, setStackSort] = useState("tool");
  const [stackSortDir, setStackSortDir] = useState<SortDir>("asc");

  const [troubleFilter, setTroubleFilter] = useState("all");

  const q = search.toLowerCase().trim();

  // Filtered + sorted data
  const filteredTerms = useMemo(() => {
    let items = data.terms.filter(
      (t) =>
        (!q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)) &&
        (termFilter === "all" || t.category === termFilter)
    );
    return sortItems(items, termSort, termSortDir);
  }, [data.terms, q, termFilter, termSort, termSortDir]);

  const filteredCommands = useMemo(() => {
    let items = data.commands.filter(
      (c) =>
        (!q || c.command.toLowerCase().includes(q) || c.what.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) &&
        (cmdSafetyFilter === "all" || c.safety === cmdSafetyFilter)
    );
    return sortItems(items, cmdSort, cmdSortDir);
  }, [data.commands, q, cmdSafetyFilter, cmdSort, cmdSortDir]);

  const filteredStack = useMemo(() => {
    let items = data.stack.filter(
      (s) => !q || s.tool.toLowerCase().includes(q) || s.what.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
    return sortItems(items, stackSort, stackSortDir);
  }, [data.stack, q, stackSort, stackSortDir]);

  const filteredFaqs = useMemo(
    () => data.faqs.filter((f) => !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)),
    [data.faqs, q]
  );

  const filteredTroubleshooting = useMemo(() => {
    let items = data.troubleshooting.filter(
      (t) =>
        (!q || t.problem.toLowerCase().includes(q) || t.likely_cause.toLowerCase().includes(q)) &&
        (troubleFilter === "all" || t.severity === troubleFilter)
    );
    return items;
  }, [data.troubleshooting, q, troubleFilter]);

  // Category options
  const termCategories = useMemo(() => unique(data.terms, (t) => t.category), [data.terms]);
  const cmdCategories = useMemo(() => unique(data.commands, (c) => c.category), [data.commands]);

  function toggleSort(current: string, key: string, dir: SortDir, setKey: (k: string) => void, setDir: (d: SortDir) => void) {
    if (current === key) {
      setDir(dir === "asc" ? "desc" : "asc");
    } else {
      setKey(key);
      setDir("asc");
    }
  }

  const showSection = (id: string) => !activeSection || activeSection === id;

  return (
    <div className="min-h-screen">
      <BackToTop />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a1a] border-b-4 border-[#F2B84B]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div>
            <h1
              className="text-3xl md:text-4xl font-black uppercase text-[#fcf9f8] tracking-tight"
              style={{ fontFamily: headline }}
            >
              BicBren<span className="text-[#F2B84B]">_</span>Tech Glossary
            </h1>
            <p
              className="text-sm md:text-sm text-[#F2B84B] uppercase tracking-widest mt-1"
              style={{ fontFamily: label }}
            >
              {data.meta.tagline}
            </p>
          </div>
          <div
            className="hidden md:block text-xs text-[#fcf9f8]/60 uppercase"
            style={{ fontFamily: label }}
          >
            Updated {data.meta.lastUpdated}
          </div>
        </div>
      </header>

      {/* Ticker */}
      <div className="ticker-wrap bg-[#4d7cf5]">
        <div className="ticker-content py-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className="text-lg md:text-xl font-black uppercase text-white tracking-wider mx-8"
              style={{ fontFamily: headline }}
            >
              TERMS &bull; COMMANDS &bull; YOUR STACK &bull; SAFE PRACTICES &bull; FILE TYPES &bull; SYMBOLS &bull; FAQs &bull; TROUBLESHOOTING &bull;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Search + Nav */}
      <div className="sticky top-[76px] md:top-[80px] z-40 bg-[#fcf9f8] border-b-4 border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="SEARCH THE GLOSSARY..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border-4 border-[#1a1a1a] bg-white text-[#1a1a1a] text-base md:text-base font-bold uppercase tracking-wider focus:border-[#4d7cf5] focus:outline-none placeholder:text-[#1a1a1a]/30"
              style={{ fontFamily: label }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1a1a] font-black text-lg hover:text-[#ef4444] transition-colors"
              >
                X
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSection(null)}
              className={`px-3 py-1.5 text-sm md:text-xs font-bold uppercase tracking-wider border-2 border-[#1a1a1a] transition-all ${
                !activeSection ? "bg-[#1a1a1a] text-[#fcf9f8]" : "bg-white text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#fcf9f8]"
              }`}
              style={{ fontFamily: label }}
            >
              ALL
            </button>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSection(activeSection === s.id ? null : s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`px-3 py-1.5 text-sm md:text-xs font-bold uppercase tracking-wider border-2 border-[#1a1a1a] transition-all ${
                  activeSection === s.id ? "bg-[#1a1a1a] text-[#fcf9f8]" : "bg-white text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#fcf9f8]"
                }`}
                style={{ fontFamily: label }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-16 md:space-y-24">

        {/* ── RECENTLY ADDED ── */}
        {!activeSection && !q && data.recentlyAdded.length > 0 && (
          <section>
            <div className="flex items-start gap-4 md:gap-6 mb-6 md:mb-8">
              <span
                className="text-5xl md:text-7xl font-black leading-none select-none"
                style={{ fontFamily: headline, color: "#F2B84B" }}
              >
                //
              </span>
              <h2
                className="text-3xl md:text-5xl font-black uppercase pb-2 flex-1"
                style={{ fontFamily: headline, borderBottom: "4px solid #F2B84B" }}
              >
                Recently Added
              </h2>
            </div>
            <div className="space-y-3">
              {data.recentlyAdded.map((item, i) => {
                const sectionMeta = SECTIONS.find(
                  (s) =>
                    s.id === item.section ||
                    (item.section === "safePractices" && s.id === "safety") ||
                    (item.section === "fileTypes" && s.id === "files")
                );
                const sectionLabel = sectionMeta?.label ?? item.section.toUpperCase();
                const sectionColor = sectionMeta?.color === "gold" ? "#F2B84B" : "#4d7cf5";
                const targetId = slug(item.name);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      const el = document.getElementById(targetId);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                        const btn = el.querySelector("button");
                        if (btn) btn.click();
                      }
                    }}
                    className="w-full text-left border-4 border-[#1a1a1a] bg-white brutalist-shadow-sm p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span
                        className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-[#1a1a1a] flex-shrink-0"
                        style={{
                          fontFamily: label,
                          background: sectionColor,
                          color: sectionColor === "#F2B84B" ? "#1a1a1a" : "#ffffff",
                        }}
                      >
                        {sectionLabel}
                      </span>
                      <h3
                        className="text-base md:text-lg font-black uppercase truncate"
                        style={{ fontFamily: headline }}
                      >
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-[#1a1a1a]/70 md:max-w-[50%]">
                      {item.summary}
                    </p>
                    <span
                      className="text-xs text-[#1a1a1a]/30 uppercase flex-shrink-0"
                      style={{ fontFamily: label }}
                    >
                      {item.dateAdded}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 01 TERMS ── */}
        {showSection("terms") && filteredTerms.length > 0 && (
          <section>
            <SectionHeader number="01" title="Terms" color="blue" id="terms" />
            <Legend>
              {termCategories.map((cat) => (
                <span key={cat} className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#4d7cf5] border-2 border-[#1a1a1a]" />
                  <span className="text-xs uppercase" style={{ fontFamily: label }}>{cat}</span>
                </span>
              ))}
            </Legend>
            <SortBar
              options={[
                { key: "term", label: "Name" },
                { key: "category", label: "Category" },
              ]}
              current={termSort}
              direction={termSortDir}
              onSort={(k) => toggleSort(termSort, k, termSortDir, setTermSort, setTermSortDir)}
              filterOptions={termCategories.map((c) => ({ key: c, label: c }))}
              currentFilter={termFilter}
              onFilter={(k) => setTermFilter(k)}
            />
            <div className="space-y-3">
              {filteredTerms.map((t) => (
                <CollapsibleCard
                  key={t.term}
                  id={slug(t.term)}
                  title={t.term}
                  accentColor="#4d7cf5"
                >
                  <div className="space-y-3">
                    <span
                      className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#4d7cf5]/10 text-[#4d7cf5] border-2 border-[#4d7cf5]/30"
                      style={{ fontFamily: label }}
                    >
                      {t.category}
                    </span>
                    <p className="text-sm md:text-base leading-relaxed">{t.definition}</p>
                    <div className="pt-3 border-t-2 border-[#1a1a1a]/10">
                      <p className="text-xs uppercase tracking-wider text-[#4d7cf5] font-bold mb-1" style={{ fontFamily: label }}>
                        Example
                      </p>
                      <p className="text-sm leading-relaxed text-[#1a1a1a]/70">{t.example}</p>
                    </div>
                  </div>
                </CollapsibleCard>
              ))}
            </div>
          </section>
        )}

        {/* ── 02 COMMANDS ── */}
        {showSection("commands") && filteredCommands.length > 0 && (
          <section>
            <SectionHeader number="02" title="Commands" color="gold" id="commands" />
            <Legend>
              <span className="flex items-center gap-2">
                <SafetyBadge level="safe" />
                <span className="text-xs">{data.meta.safetyLegend.safe}</span>
              </span>
              <span className="flex items-center gap-2">
                <SafetyBadge level="caution" />
                <span className="text-xs">{data.meta.safetyLegend.caution}</span>
              </span>
              <span className="flex items-center gap-2">
                <SafetyBadge level="dangerous" />
                <span className="text-xs">{data.meta.safetyLegend.dangerous}</span>
              </span>
            </Legend>
            <SortBar
              options={[
                { key: "command", label: "Name" },
                { key: "category", label: "Category" },
                { key: "safety", label: "Safety Level" },
              ]}
              current={cmdSort}
              direction={cmdSortDir}
              onSort={(k) => toggleSort(cmdSort, k, cmdSortDir, setCmdSort, setCmdSortDir)}
              filterOptions={[
                { key: "safe", label: "Safe" },
                { key: "caution", label: "Caution" },
                { key: "dangerous", label: "Dangerous" },
              ]}
              currentFilter={cmdSafetyFilter}
              onFilter={(k) => setCmdSafetyFilter(k)}
            />
            <div className="space-y-3">
              {filteredCommands.map((c) => (
                <CollapsibleCard
                  key={c.command}
                  id={slug(c.command)}
                  title={c.command}
                  accentColor="#F2B84B"
                  rightLabel={<SafetyBadge level={c.safety} />}
                >
                  <div className="space-y-3">
                    <span
                      className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#F2B84B]/10 text-[#1a1a1a] border-2 border-[#F2B84B]/30"
                      style={{ fontFamily: label }}
                    >
                      {c.category}
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#F2B84B] font-bold mb-1" style={{ fontFamily: label }}>
                        What it does
                      </p>
                      <p className="text-sm md:text-base leading-relaxed">{c.what}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#F2B84B] font-bold mb-1" style={{ fontFamily: label }}>
                        When to use
                      </p>
                      <p className="text-sm md:text-base leading-relaxed">{c.when}</p>
                    </div>
                    <div className="pt-3 border-t-2 border-[#1a1a1a]/10">
                      <p className="text-xs uppercase tracking-wider text-[#1a1a1a]/40 font-bold mb-1" style={{ fontFamily: label }}>
                        Example
                      </p>
                      <p className="text-sm leading-relaxed text-[#1a1a1a]/70">{c.example}</p>
                    </div>
                  </div>
                </CollapsibleCard>
              ))}
            </div>
          </section>
        )}

        {/* ── 03 YOUR STACK ── */}
        {showSection("stack") && filteredStack.length > 0 && (
          <section>
            <SectionHeader number="03" title="Your Stack" color="blue" id="stack" />
            <SortBar
              options={[
                { key: "tool", label: "Name" },
                { key: "category", label: "Category" },
              ]}
              current={stackSort}
              direction={stackSortDir}
              onSort={(k) => toggleSort(stackSort, k, stackSortDir, setStackSort, setStackSortDir)}
            />
            <div className="space-y-3">
              {filteredStack.map((s) => (
                <CollapsibleCard
                  key={s.tool}
                  id={slug(s.tool)}
                  title={s.tool}
                  accentColor="#4d7cf5"
                >
                  <div className="space-y-3">
                    <span
                      className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#4d7cf5]/10 text-[#4d7cf5] border-2 border-[#4d7cf5]/30"
                      style={{ fontFamily: label }}
                    >
                      {s.category}
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#4d7cf5] font-bold mb-1" style={{ fontFamily: label }}>
                        What it is
                      </p>
                      <p className="text-sm md:text-base leading-relaxed">{s.what}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#4d7cf5] font-bold mb-1" style={{ fontFamily: label }}>
                        Why we use it
                      </p>
                      <p className="text-sm md:text-base leading-relaxed">{s.why}</p>
                    </div>
                    <div className="pt-3 border-t-2 border-[#1a1a1a]/10">
                      <p className="text-xs uppercase tracking-wider text-[#1a1a1a]/40 font-bold mb-1" style={{ fontFamily: label }}>
                        Think of it as
                      </p>
                      <p className="text-sm leading-relaxed text-[#1a1a1a]/70 italic">{s.analogy}</p>
                    </div>
                  </div>
                </CollapsibleCard>
              ))}
            </div>
          </section>
        )}

        {/* ── 04 SAFE PRACTICES ── */}
        {showSection("safety") && (
          <section>
            <SectionHeader number="04" title="Safe Practices" color="gold" id="safety" />
            <div className="space-y-3">
              {data.safePractices.map((p) => (
                <CollapsibleCard
                  key={p.title}
                  id={slug(p.title)}
                  title={p.title}
                  accentColor="#F2B84B"
                >
                  <div className="space-y-3">
                    <span
                      className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#F2B84B]/10 text-[#1a1a1a] border-2 border-[#F2B84B]/30"
                      style={{ fontFamily: label }}
                    >
                      {p.category}
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#F2B84B] font-bold mb-1" style={{ fontFamily: label }}>
                        The Rule
                      </p>
                      <p className="text-sm md:text-base leading-relaxed font-bold">{p.rule}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#F2B84B] font-bold mb-1" style={{ fontFamily: label }}>
                        Why
                      </p>
                      <p className="text-sm md:text-base leading-relaxed">{p.why}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#F2B84B] font-bold mb-1" style={{ fontFamily: label }}>
                        How
                      </p>
                      <p className="text-sm md:text-base leading-relaxed">{p.how}</p>
                    </div>
                    <div className="pt-3 border-t-2 border-[#1a1a1a]/10">
                      <p className="text-xs uppercase tracking-wider text-[#1a1a1a]/40 font-bold mb-1" style={{ fontFamily: label }}>
                        Real story
                      </p>
                      <p className="text-sm leading-relaxed text-[#1a1a1a]/70">{p.realStory}</p>
                    </div>
                  </div>
                </CollapsibleCard>
              ))}
            </div>
          </section>
        )}

        {/* ── 05 FILE TYPES ── */}
        {showSection("files") && (
          <section>
            <SectionHeader number="05" title="File Types" color="blue" id="files" />
            <Legend>
              <span className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#22c55e]">Can edit</span>
                <span className="text-xs">— safe to modify yourself</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#ef4444]">Don&apos;t edit</span>
                <span className="text-xs">— leave to developers</span>
              </span>
            </Legend>
            <div className="space-y-3">
              {data.fileTypes.map((f) => (
                <CollapsibleCard
                  key={f.extension}
                  id={slug(f.extension)}
                  title={`${f.extension}  —  ${f.name}`}
                  accentColor="#4d7cf5"
                  rightLabel={
                    <span
                      className={`text-xs font-bold uppercase px-2 py-1 border-2 border-[#1a1a1a] ${
                        f.can_edit === true || (typeof f.can_edit === "string" && f.can_edit.toLowerCase().startsWith("yes"))
                          ? "bg-[#22c55e]/20 text-[#166534]"
                          : f.can_edit === false
                            ? "bg-[#ef4444]/20 text-[#991b1b]"
                            : "bg-[#F2B84B]/20 text-[#92400e]"
                      }`}
                      style={{ fontFamily: label }}
                    >
                      {f.can_edit === true ? "Editable" : f.can_edit === false ? "Don't edit" : "Careful"}
                    </span>
                  }
                >
                  <div className="space-y-2">
                    <p className="text-sm md:text-base leading-relaxed">{f.what}</p>
                    <p className="text-sm text-[#1a1a1a]/60">
                      <span className="font-bold uppercase text-xs" style={{ fontFamily: label }}>Where you see it:</span> {f.you_see_it}
                    </p>
                    <p className="text-sm text-[#1a1a1a]/60">
                      <span className="font-bold uppercase text-xs" style={{ fontFamily: label }}>Can edit:</span>{" "}
                      {typeof f.can_edit === "boolean" ? (f.can_edit ? "Yes" : "No — leave to developers") : f.can_edit}
                    </p>
                    {f.note && <p className="text-sm text-[#ef4444]/80 font-bold mt-1">{f.note}</p>}
                  </div>
                </CollapsibleCard>
              ))}
            </div>
          </section>
        )}

        {/* ── 06 SYMBOLS ── */}
        {showSection("symbols") && (
          <section>
            <SectionHeader number="06" title="Symbols & Syntax" color="gold" id="symbols" />
            <div className="space-y-3">
              {data.symbols.map((s) => (
                <CollapsibleCard
                  key={s.symbol}
                  id={slug(s.name)}
                  title={s.symbol}
                  accentColor="#F2B84B"
                  rightLabel={
                    <span className="text-xs text-[#fcf9f8]/50 uppercase hidden md:inline" style={{ fontFamily: label }}>
                      {s.name}
                    </span>
                  }
                >
                  <div className="space-y-2">
                    <span
                      className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#F2B84B]/10 text-[#1a1a1a] border-2 border-[#F2B84B]/30 md:hidden"
                      style={{ fontFamily: label }}
                    >
                      {s.name}
                    </span>
                    <p className="text-sm md:text-base leading-relaxed">{s.what}</p>
                    <p className="text-sm text-[#1a1a1a]/70">
                      <span className="font-bold text-[#F2B84B]">Example:</span> {s.example}
                    </p>
                  </div>
                </CollapsibleCard>
              ))}
            </div>
          </section>
        )}

        {/* ── 07 FAQs ── */}
        {showSection("faqs") && filteredFaqs.length > 0 && (
          <section>
            <SectionHeader number="07" title="FAQs" color="blue" id="faqs" />
            <Legend>
              <span className="flex items-center gap-2">
                <span className="text-xs">Tap a question to reveal the answer and solution.</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 bg-[#4d7cf5]/10 text-[#4d7cf5] border border-[#4d7cf5]/30 text-xs font-bold" style={{ fontFamily: label }}>Related</span>
                <span className="text-xs">— links to related glossary terms</span>
              </span>
            </Legend>
            <div className="space-y-3">
              {filteredFaqs.map((f, i) => (
                <CollapsibleCard
                  key={i}
                  id={slug(f.question)}
                  title={f.question}
                  accentColor="#4d7cf5"
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#4d7cf5] font-bold mb-1" style={{ fontFamily: label }}>
                        Why this happens
                      </p>
                      <p className="text-sm md:text-base leading-relaxed">{f.answer}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#4d7cf5] font-bold mb-1" style={{ fontFamily: label }}>
                        What to do
                      </p>
                      <p className="text-sm md:text-base leading-relaxed">{f.solution}</p>
                    </div>
                    {f.related.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-3 border-t-2 border-[#1a1a1a]/10">
                        <span className="text-xs text-[#1a1a1a]/40 uppercase mr-1" style={{ fontFamily: label }}>
                          Related:
                        </span>
                        {f.related.map((r) => (
                          <span
                            key={r}
                            className="text-xs px-2 py-0.5 bg-[#4d7cf5]/10 text-[#4d7cf5] border border-[#4d7cf5]/30 font-bold"
                            style={{ fontFamily: label }}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsibleCard>
              ))}
            </div>
          </section>
        )}

        {/* ── 08 TROUBLESHOOTING ── */}
        {showSection("troubleshooting") && filteredTroubleshooting.length > 0 && (
          <section>
            <SectionHeader number="08" title="Troubleshooting" color="gold" id="troubleshooting" />
            <Legend>
              <span className="flex items-center gap-2">
                <SeverityDot severity="common" />
                <span className="text-xs">Common issue — happens frequently</span>
              </span>
              <span className="flex items-center gap-2">
                <SeverityDot severity="occasional" />
                <span className="text-xs">Occasional issue — less frequent</span>
              </span>
            </Legend>
            <SortBar
              options={[]}
              current=""
              direction="asc"
              onSort={() => {}}
              filterOptions={[
                { key: "common", label: "Common" },
                { key: "occasional", label: "Occasional" },
              ]}
              currentFilter={troubleFilter}
              onFilter={(k) => setTroubleFilter(k)}
            />
            <div className="space-y-3">
              {filteredTroubleshooting.map((t, i) => (
                <CollapsibleCard
                  key={i}
                  id={slug(t.problem)}
                  title={t.problem}
                  accentColor="#F2B84B"
                  badges={<SeverityDot severity={t.severity} />}
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#F2B84B] font-bold mb-1" style={{ fontFamily: label }}>
                        Likely cause
                      </p>
                      <p className="text-sm md:text-base leading-relaxed">{t.likely_cause}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#F2B84B] font-bold mb-1" style={{ fontFamily: label }}>
                        Steps to fix
                      </p>
                      <ol className="space-y-2">
                        {t.steps.map((step, j) => (
                          <li key={j} className="flex gap-3 text-sm md:text-base leading-relaxed">
                            <span className="text-[#F2B84B] font-black flex-shrink-0">{j + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t-2 border-[#1a1a1a]/10">
                      <SeverityDot severity={t.severity} />
                      <span className="text-xs text-[#1a1a1a]/40 uppercase" style={{ fontFamily: label }}>
                        {t.severity} issue
                      </span>
                    </div>
                  </div>
                </CollapsibleCard>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-4 border-[#1a1a1a] bg-[#1a1a1a] text-[#fcf9f8]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2
                className="text-xl md:text-2xl font-black uppercase"
                style={{ fontFamily: headline }}
              >
                BicBren<span className="text-[#F2B84B]">_</span>Tech Glossary
              </h2>
              <p className="text-xs text-[#fcf9f8]/40 uppercase tracking-wider mt-1" style={{ fontFamily: label }}>
                Hot Panda Media &bull; KOT Projects
              </p>
            </div>
            <div className="text-xs text-[#fcf9f8]/40 uppercase" style={{ fontFamily: label }}>
              <p>
                {data.terms.length} terms &bull; {data.commands.length} commands &bull; {data.faqs.length} FAQs
              </p>
              <p className="mt-1">Last updated: {data.meta.lastUpdated}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
