import { useState, useEffect, useRef, useMemo } from 'react';
import { calculateTax, BRACKET_COLORS, COUNTRIES, REGIONS } from './taxData';
import { useInView } from './useInView';
import { useCountUp } from './useCountUp';

/* ── Quick income presets ──────────────────────────── */
const PRESETS = [
  { label: '30K',  value: 30000 },
  { label: '60K',  value: 60000 },
  { label: '100K', value: 100000 },
  { label: '150K', value: 150000 },
  { label: '250K', value: 250000 },
  { label: '500K', value: 500000 },
];

/* ── Deterministic particles ── */
const PARTICLE_POOL = [
  '$','£','€','₹','¥','💰','🪙','💵','📈','💳','🏦','💹','🤑','📊',
  '$','€','₹','💰','🪙','💵','📈','💳','$','£',
];
const PARTICLES = PARTICLE_POOL.map((sym, i) => ({
  id: i, symbol: sym,
  left: `${(i * 19 + 3) % 94 + 2}%`,
  delay: `${(i * 0.83) % 11}s`,
  duration: `${11 + (i * 1.4) % 11}s`,
  size: `${13 + (i * 5) % 18}px`,
  opacity: 0.13 + (i % 6) * 0.04,
}));

export default function App() {
  const [countryCode, setCountryCode]   = useState('us');
  const [income, setIncome]             = useState('');
  const [filingStatus, setFilingStatus] = useState('single');
  const [dark, setDark]                 = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [hoveredBracket, setHoveredBracket] = useState(null);
  const [shareCopied, setShareCopied]   = useState(false);

  const country = COUNTRIES[countryCode];

  // URL sync — read on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const urlCountry = p.get('c');
    const urlIncome  = p.get('i');
    const urlStatus  = p.get('s');
    if (urlCountry && COUNTRIES[urlCountry]) {
      const defaultStatus = Object.keys(COUNTRIES[urlCountry].statuses)[0];
      setCountryCode(urlCountry);
      setFilingStatus(urlStatus || defaultStatus);
      if (urlIncome && Number(urlIncome) > 0) {
        setIncome(Number(urlIncome).toLocaleString(COUNTRIES[urlCountry].locale));
      }
    } else if (urlIncome && Number(urlIncome) > 0) {
      setIncome(Number(urlIncome).toLocaleString('en-US'));
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const fmt = (n) =>
    new Intl.NumberFormat(country.locale, {
      style:'currency', currency:country.currency, maximumFractionDigits:0,
    }).format(n);

  const fmtCompact = (n) =>
    new Intl.NumberFormat(country.locale, {
      style:'currency', currency:country.currency, notation:'compact', maximumFractionDigits:1,
    }).format(n);

  const pct = (n) => (n * 100).toFixed(2) + '%';

  const handleCountryChange = (code) => {
    setCountryCode(code);
    setFilingStatus(Object.keys(COUNTRIES[code].statuses)[0]);
    setIncome('');
  };

  const numericIncome = parseFloat(income.replace(/[^0-9.]/g, '')) || 0;
  const result        = calculateTax(numericIncome, countryCode, filingStatus);
  const hasIncome     = numericIncome > 0;
  const multiStatuses = Object.keys(country.statuses).length > 1;

  const currencySymbol = new Intl.NumberFormat(country.locale, {
    style:'currency', currency:country.currency, maximumFractionDigits:0,
  }).formatToParts(0).find(p => p.type === 'currency')?.value ?? '$';

  // Slider max — highest finite bracket * 1.5, min 200 000
  const sliderMax = useMemo(() => {
    const real = result.breakdown.filter(b => b.max !== Infinity);
    const top  = real.length ? real[real.length - 1].max : 500000;
    return Math.max(top, numericIncome, 200000);
  }, [result.breakdown, numericIncome]);

  // URL sync — write on change
  useEffect(() => {
    if (!numericIncome) {
      history.replaceState(null, '', window.location.pathname);
      return;
    }
    const p = new URLSearchParams({ c: countryCode, i: numericIncome, s: filingStatus });
    history.replaceState(null, '', '?' + p.toString());
  }, [numericIncome, countryCode, filingStatus]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[#f8f7ff] dark:bg-[#07080f] text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-x-hidden">

      {/* ── Sticky header ─────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] dark:border-white/[0.06]"
        style={{ backdropFilter:'blur(20px)', background:'rgba(248,247,255,0.80)' }}>
        <style>{`.dark header{background:rgba(7,8,15,0.85)!important}`}</style>
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
              style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              📊
            </div>
            <span className="font-bold tracking-tight gradient-text text-base">Tax Bracket Visualizer</span>
          </div>
          <div className="flex items-center gap-2">
            {hasIncome && (
              <>
                <button onClick={handleShare}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700/60 rounded-lg px-3 py-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all">
                  {shareCopied ? '✓ Copied!' : '🔗 Share'}
                </button>
                <button onClick={handlePrint}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 hover:bg-white dark:hover:bg-white/10 transition-all">
                  🖨️ Print
                </button>
              </>
            )}
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1">
              {country.flag} {country.name} · {country.year}
            </span>
            <button onClick={() => setDark(d => !d)}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all text-sm">
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="hero-mesh noise relative min-h-[88vh] flex flex-col items-center justify-center px-4 py-14 overflow-hidden">

        {/* Blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[
            { cls:'blob  blob-d1', w:600, top:'-10rem', left:'-10rem', bg:'#7c3aed,#4f46e5' },
            { cls:'blob2 blob-d2', w:450, top:'-2rem',  left:'auto', right:'-7rem', bg:'#ec4899,#db2777' },
            { cls:'blob  blob-d3', w:380, top:'auto',   bottom:'-2rem', left:'30%', bg:'#06b6d4,#0891b2' },
            { cls:'blob2 blob-d4', w:300, top:'auto',   bottom:'3rem',  left:'auto', right:'-3rem', bg:'#f59e0b,#f97316' },
            { cls:'blob  blob-d2', w:260, top:'45%',    left:'2rem', bg:'#10b981,#059669' },
          ].map((b, i) => (
            <div key={i} className={`${b.cls} absolute rounded-full opacity-[0.50] dark:opacity-[0.60]`}
              style={{
                width: b.w, height: b.w,
                top: b.top, left: b.left ?? 'auto', right: b.right ?? 'auto', bottom: b.bottom ?? 'auto',
                background: `radial-gradient(circle, ${b.bg.split(',')[0]} 0%, ${b.bg.split(',')[1]} 40%, transparent 70%)`,
              }} />
          ))}
        </div>

        {/* Floating money particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          {PARTICLES.map(p => (
            <span key={p.id} className="particle select-none"
              style={{ left: p.left, fontSize: p.size, opacity: p.opacity, animationDuration: p.duration, animationDelay: p.delay }}>
              {p.symbol}
            </span>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-2xl space-y-4">
          {/* Badge + heading */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700/60 rounded-full px-4 py-1.5">
              <span className="coin-spin">🪙</span> Income Tax Calculator
            </div>
            <h1 className="text-4xl sm:text-[3.25rem] font-extrabold tracking-tight gradient-text leading-[1.1]">
              See exactly where<br />your money goes
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Visualize how your income is taxed across every bracket — instantly.
            </p>
          </div>

          {/* Country picker */}
          <CountryPicker countryCode={countryCode} onChange={handleCountryChange} />

          {/* Income input card */}
          <div className="card p-5 space-y-4">
            {/* Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.16em] mb-2">
                Taxable Income · {country.currency}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl select-none">{currencySymbol}</span>
                <input type="text" inputMode="numeric" value={income}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setIncome(raw ? Number(raw).toLocaleString(country.locale) : '');
                  }}
                  placeholder={country.inputPlaceholder}
                  className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] text-2xl font-mono transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                />
              </div>
              {country.note && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">{country.note}</p>
              )}
            </div>

            {/* Slider */}
            <div>
              <input type="range" min="0" max={sliderMax} step={Math.max(1000, Math.round(sliderMax / 500))}
                value={numericIncome || 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setIncome(val ? val.toLocaleString(country.locale) : '');
                }}
                className="w-full"
                style={{
                  background: numericIncome
                    ? `linear-gradient(to right, #6366f1 ${Math.min((numericIncome / sliderMax) * 100, 100)}%, rgba(148,163,184,0.25) ${Math.min((numericIncome / sliderMax) * 100, 100)}%)`
                    : 'rgba(148,163,184,0.25)',
                }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-400 font-mono">{currencySymbol}0</span>
                <span className="text-[10px] text-slate-400 font-mono">{fmtCompact(sliderMax)}</span>
              </div>
            </div>

            {/* Quick presets */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.16em] mb-2">Quick Examples</p>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map(({ label, value }) => (
                  <button key={label}
                    className={`preset-btn ${numericIncome === value ? 'preset-btn-active' : ''}`}
                    onClick={() => setIncome(value.toLocaleString(country.locale))}
                  >
                    {currencySymbol}{label}
                  </button>
                ))}
              </div>
            </div>

            {multiStatuses && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.16em] mb-2">Filing Status</label>
                <div className="flex flex-col gap-1.5">
                  {Object.entries(country.statuses).map(([value, { label, icon }]) => (
                    <button key={value} onClick={() => setFilingStatus(value)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                        filingStatus === value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700/60 bg-white/60 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-indigo-300'
                      }`}>
                      <span>{icon}</span>{label}
                      {filingStatus === value && <span className="ml-auto w-2 h-2 rounded-full bg-indigo-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Live summary strip ── */}
          <div className={`card overflow-hidden transition-all duration-500 ${hasIncome ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/5">
              {[
                { label:'Tax Paid',      val: hasIncome ? fmt(result.totalTax) : '—',                color:'text-rose-500 dark:text-rose-400' },
                { label:'Take-Home',     val: hasIncome ? fmt(numericIncome - result.totalTax) : '—', color:'text-emerald-600 dark:text-emerald-400' },
                { label:'Effective Rate',val: hasIncome ? pct(result.effectiveRate) : '—',            color:'gradient-text' },
              ].map(({ label, val, color }) => (
                <div key={label} className="p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">{label}</p>
                  <p className={`text-base sm:text-lg font-extrabold font-mono ${color}`}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity duration-500 ${hasIncome ? 'opacity-100 text-slate-400 dark:text-slate-500' : 'opacity-25 text-slate-300 dark:text-slate-700'}`}>
          <span className="text-[10px] font-bold uppercase tracking-widest">Scroll to explore</span>
          <svg className="w-5 h-5 bounce-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Results ────────────────────────────────────── */}
      {hasIncome && (
        <>
          {/* Section 1 — Metrics */}
          <section className="section-violet py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-5">
              <SectionLabel icon="📊" text="Summary" />
              <MetricsRow result={result} fmt={fmt} pct={pct} />
            </div>
          </section>

          <WaveDivider from="#ede9fe" to="#ccfbf1" darkFrom="#110d24" darkTo="#031a16" />

          {/* Section 2 — Bar chart */}
          <section className="section-teal py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-5">
              <SectionLabel icon="🎨" text="Income Distribution" />
              <Reveal direction="from-left">
                <div className="card p-5 sm:p-6">
                  <div className="flex items-end justify-between mb-3">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {fmt(numericIncome)} across {result.breakdown.filter(b => b.incomeInBracket > 0).length} bracket{result.breakdown.filter(b => b.incomeInBracket > 0).length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs font-bold text-rose-500 dark:text-rose-400 font-mono">
                      {fmt(result.totalTax)} tax
                    </p>
                  </div>
                  <AnimatedBar
                    breakdown={result.breakdown}
                    income={numericIncome}
                    fmt={fmt}
                    fmtCompact={fmtCompact}
                    hoveredBracket={hoveredBracket}
                    setHoveredBracket={setHoveredBracket}
                  />
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {result.breakdown.map((b, i) =>
                      b.incomeInBracket > 0 ? (
                        <div key={i}
                          className={`flex items-center gap-2 cursor-default transition-opacity ${hoveredBracket !== null && hoveredBracket !== i ? 'opacity-35' : 'opacity-100'}`}
                          onMouseEnter={() => setHoveredBracket(i)}
                          onMouseLeave={() => setHoveredBracket(null)}
                        >
                          <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: BRACKET_COLORS[i] }} />
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {(b.rate * 100).toFixed(1)}% — {fmtCompact(b.incomeInBracket)}
                          </span>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          <WaveDivider from="#f0fdf9" to="#fce7f3" darkFrom="#061412" darkTo="#1a0810" />

          {/* Section 3 — Table + Tax Meter */}
          <section className="section-rose py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-5">
              <SectionLabel icon="🧾" text="Bracket Breakdown" />
              <Reveal direction="from-right">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Table */}
                  <div className="lg:col-span-2 card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50/80 dark:bg-white/5 text-left">
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rate</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Range</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Income</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Tax</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {result.breakdown.map((b, i) => {
                            const active    = b.incomeInBracket > 0;
                            const isHovered = hoveredBracket === i;
                            return (
                              <tr key={i}
                                className={`transition-colors cursor-default ${
                                  active
                                    ? `table-row-active ${isHovered ? 'bg-slate-50 dark:bg-white/[0.07]' : 'hover:bg-slate-50/70 dark:hover:bg-white/[0.04]'}`
                                    : 'opacity-25'
                                }`}
                                style={{ '--row-accent': BRACKET_COLORS[i] }}
                                onMouseEnter={() => active && setHoveredBracket(i)}
                                onMouseLeave={() => setHoveredBracket(null)}
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                                      style={{ backgroundColor: BRACKET_COLORS[i] }}>
                                      {(b.rate * 100).toFixed(0)}
                                    </div>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{(b.rate * 100).toFixed(1)}%</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-400">
                                  {fmt(b.min)} – {b.max === Infinity ? '∞' : fmt(b.max)}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                                  {active ? fmt(b.incomeInBracket) : '—'}
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                                  {active ? fmt(b.taxOwed) : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-pink-200 dark:border-pink-900/50"
                            style={{ background:'linear-gradient(90deg,rgba(236,72,153,0.05),rgba(139,92,246,0.05))' }}>
                            <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-300" colSpan={2}>Total</td>
                            <td className="px-4 py-4 text-right font-mono font-semibold text-slate-600 dark:text-slate-400">{fmt(numericIncome)}</td>
                            <td className="px-4 py-4 text-right font-mono font-bold text-pink-600 dark:text-pink-400 text-base">{fmt(result.totalTax)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Tax meter sidebar */}
                  <TaxMeterCard result={result} pct={pct} />
                </div>
              </Reveal>
            </div>
          </section>

          <WaveDivider from="#fff1f8" to="#ede9fe" darkFrom="#150610" darkTo="#110d24" />

          {/* Section 4 — Tax Insights */}
          <section className="section-violet py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-5">
              <SectionLabel icon="💡" text="Tax Insights" />
              <Reveal direction="from-below">
                <InsightsCard result={result} fmt={fmt} fmtCompact={fmtCompact} pct={pct} income={numericIncome} />
              </Reveal>
            </div>
          </section>

          {/* Take-home strip */}
          <TakeHomeStrip
            income={numericIncome}
            tax={result.totalTax}
            fmt={fmt}
            pct={pct}
            effectiveRate={result.effectiveRate}
            onShare={handleShare}
            onPrint={handlePrint}
            shareCopied={shareCopied}
          />
        </>
      )}

      {/* Empty state */}
      {!hasIncome && <EmptyState />}

      <footer className="border-t border-slate-200 dark:border-white/5 py-5 px-4 text-center">
        <p className="text-xs text-slate-300 dark:text-slate-700">
          For estimation purposes only · Consult a tax professional for advice
        </p>
      </footer>
    </div>
  );
}

/* ── Metrics row ───────────────────────────────────── */
function MetricsRow({ result, fmt, pct }) {
  const [ref, inView] = useInView();
  const taxRaw      = useCountUp(Math.round(result.totalTax), 1300);
  const effectRaw   = useCountUp(Math.round(result.effectiveRate * 10000), 1200);
  const marginalRaw = useCountUp(Math.round(result.marginalRate  * 10000), 1100);
  const fmtPct = (raw) => (raw / 100).toFixed(2) + '%';

  return (
    <div ref={ref} className={`stagger grid grid-cols-1 sm:grid-cols-3 gap-4 ${inView ? 'visible' : ''}`}>
      <GlowMetricCard label="Total Tax Owed"   value={inView ? fmt(taxRaw)        : fmt(0)}    sub="federal/national only"
        icon="💸" gradient="linear-gradient(135deg,#4f46e5,#6366f1,#818cf8)" glowClass="glow-indigo" />
      <GlowMetricCard label="Effective Rate"   value={inView ? fmtPct(effectRaw)  : '0.00%'}   sub="avg across all income"
        icon="📉" gradient="linear-gradient(135deg,#059669,#10b981,#34d399)" glowClass="glow-emerald" />
      <GlowMetricCard label="Marginal Rate"    value={inView ? fmtPct(marginalRaw): '0.00%'}   sub="on your next dollar"
        icon="📈" gradient="linear-gradient(135deg,#7c3aed,#8b5cf6,#a78bfa)" glowClass="glow-violet" />
    </div>
  );
}

function GlowMetricCard({ label, value, sub, icon, gradient, glowClass }) {
  return (
    <div className={`metric-card ${glowClass}`} style={{ background: gradient }}>
      <div className="shimmer absolute inset-0 rounded-[20px] pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">{label}</p>
          <span className="text-2xl coin-spin">{icon}</span>
        </div>
        <p className="text-3xl font-extrabold font-mono text-white num-pop" key={value}>{value}</p>
        <p className="text-xs text-white/60 mt-2">{sub}</p>
      </div>
    </div>
  );
}

/* ── Animated bar chart ────────────────────────────── */
function AnimatedBar({ breakdown, income, fmt, fmtCompact, hoveredBracket, setHoveredBracket }) {
  const [ref, inView] = useInView(0.1);
  if (!breakdown.some(b => b.incomeInBracket > 0)) return null;

  return (
    <div ref={ref}>
      <div className="flex h-20 w-full gap-0.5 rounded-2xl overflow-hidden"
        style={{ backgroundColor:'rgba(148,163,184,0.2)' }}>
        {breakdown.map((b, i) => {
          if (b.incomeInBracket === 0) return null;
          const w = (b.incomeInBracket / income) * 100;
          const isHovered = hoveredBracket === i;
          const isDimmed  = hoveredBracket !== null && !isHovered;
          return (
            <div key={i}
              className={`bar-segment relative group flex flex-col items-center justify-center overflow-visible cursor-default ${inView ? 'bar-animate' : ''}`}
              style={{
                width: `${w}%`,
                backgroundColor: BRACKET_COLORS[i],
                flexShrink: 0,
                animationDelay: `${i * 0.08}s`,
                filter: isDimmed ? 'brightness(0.5)' : isHovered ? 'brightness(1.15)' : undefined,
                transition: 'filter 0.2s ease',
              }}
              onMouseEnter={() => setHoveredBracket(i)}
              onMouseLeave={() => setHoveredBracket(null)}
            >
              {w > 7 && (
                <div className="flex flex-col items-center leading-none pointer-events-none select-none gap-0.5">
                  <span className="text-xs font-bold text-white drop-shadow">{(b.rate * 100).toFixed(0)}%</span>
                  {w > 13 && <span className="text-[10px] text-white/75">{fmtCompact(b.incomeInBracket)}</span>}
                </div>
              )}
              {/* Tooltip */}
              <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-xl px-3 py-2.5 text-xs whitespace-nowrap shadow-2xl leading-5 border border-white/10">
                  <p className="font-bold text-sm mb-0.5" style={{ color:BRACKET_COLORS[i] }}>
                    {(b.rate * 100).toFixed(1)}% bracket
                  </p>
                  <p className="text-slate-300">{fmt(b.incomeInBracket)} taxed here</p>
                  <p className="text-white font-semibold">→ {fmt(b.taxOwed)} owed</p>
                </div>
                <div className="w-2.5 h-2.5 bg-gray-900 rotate-45 mx-auto -mt-1.5 border-r border-b border-white/10" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Tax meter ─────────────────────────────────────── */
function TaxMeterCard({ result, pct }) {
  const [ref, inView] = useInView(0.2);
  const r    = 56;
  const circ = 2 * Math.PI * r;
  const eff  = Math.min(result.effectiveRate, 1);
  const mar  = Math.min(result.marginalRate, 1);

  return (
    <div ref={ref} className="card p-6 flex flex-col items-center justify-center gap-4">
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tax Rates</p>

      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
          {/* Track */}
          <circle cx="65" cy="65" r={r} fill="none" stroke="currentColor" strokeWidth="11"
            className="text-slate-200 dark:text-slate-800" />
          {/* Marginal (faint) */}
          <circle cx="65" cy="65" r={r} fill="none"
            stroke="rgba(168,85,247,0.30)" strokeWidth="11"
            strokeDasharray={circ}
            strokeDashoffset={inView ? circ * (1 - mar) : circ}
            strokeLinecap="round"
            style={{ transition:'stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1) 0.3s' }}
          />
          {/* Effective */}
          <circle cx="65" cy="65" r={r} fill="none"
            stroke="url(#gaugeGrad)" strokeWidth="11"
            strokeDasharray={circ}
            strokeDashoffset={inView ? circ * (1 - eff) : circ}
            strokeLinecap="round"
            style={{ transition:'stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1) 0.1s' }}
          />
          <defs>
            <linearGradient id="gaugeGrad" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold font-mono gradient-text">{pct(result.effectiveRate)}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-0.5">effective</span>
        </div>
      </div>

      <div className="w-full space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)' }} />
            <span className="text-xs text-slate-500 dark:text-slate-400">Effective</span>
          </div>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">{pct(result.effectiveRate)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400/40" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Marginal</span>
          </div>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">{pct(result.marginalRate)}</span>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <span className="text-xs text-slate-400 dark:text-slate-500">Progressive savings</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
            {pct(result.marginalRate - result.effectiveRate)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Tax Insights ──────────────────────────────────── */
function InsightsCard({ result, fmt, fmtCompact, pct, income }) {
  const hasAnyTax   = result.totalTax > 0;
  const keepPct     = income > 0 ? ((income - result.totalTax) / income * 100).toFixed(1) : '100.0';
  const topIdx      = result.breakdown.reduce((best, b, i) =>
    b.taxOwed > (result.breakdown[best]?.taxOwed ?? 0) ? i : best, 0);
  const topBracket  = result.breakdown[topIdx];
  const taxFreeItem = result.breakdown.find(b => b.rate === 0 && b.incomeInBracket > 0);
  const taxFreeSave = taxFreeItem && hasAnyTax
    ? taxFreeItem.incomeInBracket * result.marginalRate
    : 0;

  const insights = [
    {
      icon: '🎯',
      label: 'You keep',
      value: `${keepPct}%`,
      desc: `of your gross — ${fmt(income - result.totalTax)} take-home`,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    hasAnyTax && {
      icon: '📊',
      label: 'Biggest contributor',
      value: `${(topBracket.rate * 100).toFixed(0)}% bracket`,
      desc: `generates ${fmt(topBracket.taxOwed)} — the largest single bracket`,
      color: 'text-violet-600 dark:text-violet-400',
    },
    hasAnyTax && {
      icon: '📉',
      label: 'Progressive savings',
      value: pct(result.marginalRate - result.effectiveRate),
      desc: `lower effective vs marginal, thanks to progressive brackets`,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    taxFreeSave > 0 && {
      icon: '🆓',
      label: 'Tax-free benefit',
      value: fmt(taxFreeSave),
      desc: `saved by your ${fmtCompact(taxFreeItem.incomeInBracket)} tax-free allowance`,
      color: 'text-amber-600 dark:text-amber-400',
    },
  ].filter(Boolean);

  return (
    <div className="card p-5 sm:p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {insights.map(({ icon, label, value, desc, color }) => (
          <div key={label} className="flex gap-3">
            <div className="text-2xl shrink-0 mt-0.5">{icon}</div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
              <p className={`text-lg font-extrabold font-mono ${color}`}>{value}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progressive tax explainer */}
      <div className="border-t border-slate-100 dark:border-white/5 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
          💡 Why is my effective rate lower than my marginal rate?
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          In a progressive system each tax rate only applies to income <em>within that band</em> — not your full income.
          Your top rate of {pct(result.marginalRate)} only hits your highest dollars, while earlier income is taxed at lower rates.
          The blended result is your effective rate of {pct(result.effectiveRate)}.
        </p>
      </div>
    </div>
  );
}

/* ── Take-home strip ───────────────────────────────── */
function TakeHomeStrip({ income, tax, fmt, pct, effectiveRate, onShare, onPrint, shareCopied }) {
  const [ref, inView] = useInView();
  const takeHome = income - tax;

  const incomeAnim   = useCountUp(inView ? Math.round(income)   : 0, 1200);
  const taxAnim      = useCountUp(inView ? Math.round(tax)      : 0, 1300);
  const takeHomeAnim = useCountUp(inView ? Math.round(takeHome) : 0, 1100);

  return (
    <section className="section-violet px-4 py-10">
      <div ref={ref} className={`reveal from-below max-w-4xl mx-auto ${inView ? 'visible' : ''}`}>
        <div className="relative rounded-2xl overflow-hidden"
          style={{ background:'linear-gradient(135deg,#4f46e5 0%,#7c3aed 35%,#db2777 70%,#f97316 100%)' }}>
          <div className="shimmer absolute inset-0 pointer-events-none" />
          <div className="relative z-10 px-6 sm:px-8 py-8 text-white">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                <span className="coin-spin">💵</span> After-Tax Snapshot
              </p>
              <div className="flex gap-2">
                <button onClick={onShare}
                  className="text-xs font-semibold bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg px-3 py-1.5 transition-all">
                  {shareCopied ? '✓ Copied!' : '🔗 Share'}
                </button>
                <button onClick={onPrint}
                  className="text-xs font-semibold bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg px-3 py-1.5 transition-all">
                  🖨️ Print
                </button>
              </div>
            </div>

            {/* Primary: monthly take-home */}
            <div className="text-center mb-6 pb-6 border-b border-white/15">
              <p className="text-sm opacity-60 mb-2 uppercase tracking-wider font-bold">Monthly Take-Home</p>
              <p className="text-5xl sm:text-6xl font-extrabold font-mono">{fmt(Math.round(takeHome / 12))}</p>
              <p className="text-sm opacity-50 mt-2">{(100 - effectiveRate * 100).toFixed(1)}% of gross retained after tax</p>
            </div>

            {/* Annual overview */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label:'Gross Income',     val: fmt(incomeAnim) },
                { label:'Tax Paid',         val: fmt(taxAnim) },
                { label:'Annual Take-Home', val: fmt(takeHomeAnim) },
              ].map(({ label, val }) => (
                <div key={label} className="text-center">
                  <p className="text-[10px] opacity-50 mb-1 uppercase tracking-wider">{label}</p>
                  <p className="text-base sm:text-xl font-extrabold font-mono">{val}</p>
                </div>
              ))}
            </div>

            {/* Time breakdowns (secondary) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label:'Monthly',   val: fmt(Math.round(takeHome / 12))  },
                { label:'Bi-Weekly', val: fmt(Math.round(takeHome / 26))  },
                { label:'Weekly',    val: fmt(Math.round(takeHome / 52))  },
                { label:'Daily',     val: fmt(Math.round(takeHome / 260)) },
              ].map(({ label, val }) => (
                <div key={label} className="text-center bg-white/10 rounded-xl px-2 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">{label}</p>
                  <p className="text-sm font-extrabold font-mono">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Empty state ───────────────────────────────────── */
function EmptyState() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-700 mb-6">
          Enter income above to unlock your full breakdown
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 opacity-35 pointer-events-none select-none">
          {[
            { label:'Total Tax Owed', icon:'💸', gradient:'linear-gradient(135deg,#4f46e5,#6366f1,#818cf8)' },
            { label:'Effective Rate', icon:'📉', gradient:'linear-gradient(135deg,#059669,#10b981,#34d399)' },
            { label:'Marginal Rate',  icon:'📈', gradient:'linear-gradient(135deg,#7c3aed,#8b5cf6,#a78bfa)' },
          ].map(({ label, icon, gradient }) => (
            <div key={label} className="metric-card" style={{ background: gradient }}>
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-white/70">{label}</p>
                <span className="text-2xl">{icon}</span>
              </div>
              <div className="h-8 w-28 rounded-lg bg-white/20 mb-2" />
              <div className="h-3 w-20 rounded bg-white/15" />
            </div>
          ))}
        </div>
        <div className="card p-5 opacity-30 pointer-events-none select-none">
          <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-700 mb-4" />
          <div className="flex h-16 gap-0.5 rounded-xl overflow-hidden">
            {[42, 28, 19, 11].map((w, i) => (
              <div key={i} style={{ width:`${w}%`, background: BRACKET_COLORS[i], opacity:0.7, borderRadius:4 }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Layout helpers ────────────────────────────────── */
function SectionLabel({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <span>{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{text}</span>
      <div className="flex-1 h-px bg-slate-200 dark:bg-white/5" />
    </div>
  );
}

function Reveal({ children, direction = 'from-below' }) {
  const [ref, inView] = useInView();
  return <div ref={ref} className={`reveal ${direction} ${inView ? 'visible' : ''}`}>{children}</div>;
}

function WaveDivider({ from, to, darkFrom, darkTo }) {
  return (
    <div className="wave-divider -my-px" style={{ lineHeight:0 }}>
      <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="w-full h-14 block dark:hidden">
        <path d="M0 0 C480 56 960 56 1440 0 L1440 56 L0 56Z" fill={from} />
        <path d="M0 56 C480 0 960 0 1440 56 L1440 56 L0 56Z" fill={to} />
      </svg>
      <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="w-full h-14 hidden dark:block">
        <path d="M0 0 C480 56 960 56 1440 0 L1440 56 L0 56Z" fill={darkFrom} />
        <path d="M0 56 C480 0 960 0 1440 56 L1440 56 L0 56Z" fill={darkTo} />
      </svg>
    </div>
  );
}

/* ── Searchable country picker ─────────────────────── */
function CountryPicker({ countryCode, onChange }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);
  const current  = COUNTRIES[countryCode];

  useEffect(() => {
    const clickHandler = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    const keyHandler   = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', clickHandler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', clickHandler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery('');
  }, [open]);

  const q = query.toLowerCase();
  const matchesQuery = (code) => {
    const c = COUNTRIES[code];
    return !q || c.name.toLowerCase().includes(q) || c.currency.toLowerCase().includes(q) || code.toLowerCase().includes(q);
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="card p-4">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.16em] mb-2">Select Country</p>
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold text-sm hover:border-indigo-500 transition-all"
        >
          <span className="text-xl">{current.flag}</span>
          <span className="flex-1 text-left">{current.name}</span>
          <span className="font-mono text-xs text-indigo-400 dark:text-indigo-500">{current.currency}</span>
          <svg className={`w-4 h-4 text-indigo-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700"
          style={{ background:'rgba(255,255,255,0.97)', backdropFilter:'blur(20px)', maxHeight:'400px', display:'flex', flexDirection:'column' }}>
          <style>{`.dark .country-dropdown{background:rgba(10,8,20,0.97)!important}`}</style>
          <div className="country-dropdown" style={{ display:'flex', flexDirection:'column', maxHeight:'400px' }}>
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search country or currency…"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>
            <div className="overflow-y-auto">
              {Object.entries(REGIONS).map(([region, codes]) => {
                const matches = codes.filter(c => COUNTRIES[c] && matchesQuery(c));
                if (matches.length === 0) return null;
                return (
                  <div key={region}>
                    <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/60 sticky top-0">
                      {region}
                    </div>
                    {matches.map(code => {
                      const c      = COUNTRIES[code];
                      const active = code === countryCode;
                      return (
                        <button key={code}
                          onClick={() => { onChange(code); setOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                            active
                              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}>
                          <span className="text-lg w-7 shrink-0">{c.flag}</span>
                          <span className="flex-1 font-medium">{c.name}</span>
                          <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{c.currency}</span>
                          {active && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
