import { useState, useEffect, useRef } from 'react';
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

/* ── Deterministic particles (no Math.random = stable renders) ── */
const PARTICLE_POOL = [
  '$','£','€','₹','¥','💰','🪙','💵','📈','💳','🏦','💹','🤑','📊',
  '$','€','₹','💰','🪙','💵','📈','💳','$','£',
];
const PARTICLES = PARTICLE_POOL.map((sym, i) => ({
  id: i,
  symbol: sym,
  left: `${(i * 19 + 3) % 94 + 2}%`,
  delay: `${(i * 0.83) % 11}s`,
  duration: `${11 + (i * 1.4) % 11}s`,
  size: `${13 + (i * 5) % 18}px`,
  opacity: 0.13 + (i % 6) * 0.04,
}));

export default function App() {
  const [countryCode, setCountryCode] = useState('us');
  const [income, setIncome]           = useState('');
  const [filingStatus, setFilingStatus] = useState('single');
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  const country = COUNTRIES[countryCode];

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
          <div className="flex items-center gap-3">
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
      <section className="hero-mesh noise relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-20 overflow-hidden">

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
              style={{
                left: p.left,
                fontSize: p.size,
                opacity: p.opacity,
                animationDuration: p.duration,
                animationDelay: p.delay,
              }}>
              {p.symbol}
            </span>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-2xl space-y-5">
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

          {/* Income + filing status */}
          <div className="card p-6 space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.16em] mb-2.5">
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
                  className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 text-2xl font-mono transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700"
                />
              </div>
              {country.note && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">{country.note}</p>
              )}
            </div>

            {/* Quick presets */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.16em] mb-2.5">Quick Examples</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map(({ label, value }) => (
                  <button key={label}
                    className="preset-btn"
                    onClick={() => setIncome(value.toLocaleString(country.locale))}
                  >
                    {currencySymbol}{label}
                  </button>
                ))}
              </div>
            </div>

            {multiStatuses && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.16em] mb-2.5">Filing Status</label>
                <div className="flex flex-col gap-2">
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
        </div>

        {/* Scroll cue */}
        <div className={`absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity duration-500 ${hasIncome ? 'opacity-100 text-slate-400 dark:text-slate-500' : 'opacity-30 text-slate-300 dark:text-slate-700'}`}>
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
          <section className="section-violet py-16 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <SectionLabel icon="📊" text="Summary" />
              <MetricsRow result={result} fmt={fmt} pct={pct} />
            </div>
          </section>

          <WaveDivider from="#ede9fe" to="#ccfbf1" darkFrom="#110d24" darkTo="#031a16" />

          {/* Section 2 — Bar chart */}
          <section className="section-teal py-16 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <SectionLabel icon="🎨" text="Income Distribution" />
              <Reveal direction="from-left">
                <div className="card p-6 sm:p-8">
                  <div className="flex items-end justify-between mb-3">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {fmt(numericIncome)} across {result.breakdown.filter(b => b.incomeInBracket > 0).length} brackets
                    </p>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {fmt(result.totalTax)} tax
                    </p>
                  </div>
                  <AnimatedBar breakdown={result.breakdown} income={numericIncome} fmt={fmt} fmtCompact={fmtCompact} />
                  <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5">
                    {result.breakdown.map((b, i) =>
                      b.incomeInBracket > 0 ? (
                        <div key={i} className="flex items-center gap-2">
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
          <section className="section-rose py-16 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
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
                            const active = b.incomeInBracket > 0;
                            return (
                              <tr key={i}
                                className={`transition-colors ${active ? 'table-row-active hover:bg-pink-50/50 dark:hover:bg-white/5' : 'opacity-25'}`}
                                style={{ '--row-accent': BRACKET_COLORS[i] }}>
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
                  <TaxMeterCard result={result} fmt={fmt} pct={pct} />
                </div>
              </Reveal>
            </div>
          </section>

          {/* Take-home strip */}
          <TakeHomeStrip income={numericIncome} tax={result.totalTax} fmt={fmt} pct={pct} effectiveRate={result.effectiveRate} />
        </>
      )}

      {/* Empty state */}
      {!hasIncome && <EmptyState />}

      <footer className="border-t border-slate-200 dark:border-white/5 py-6 px-4 text-center">
        <p className="text-xs text-slate-300 dark:text-slate-700">
          For estimation purposes only · Consult a tax professional for advice
        </p>
      </footer>
    </div>
  );
}

/* ── Metrics row with count-up ─────────────────────── */
function MetricsRow({ result, fmt, pct }) {
  const [ref, inView] = useInView();

  const taxRaw      = useCountUp(Math.round(result.totalTax),      1300);
  const effectRaw   = useCountUp(Math.round(result.effectiveRate * 10000), 1200);
  const marginalRaw = useCountUp(Math.round(result.marginalRate  * 10000), 1100);

  const fmtTax = (n) => fmt(n);
  const fmtPct = (raw) => (raw / 100).toFixed(2) + '%';

  return (
    <div ref={ref} className={`stagger grid grid-cols-1 sm:grid-cols-3 gap-4 ${inView ? 'visible' : ''}`}>
      <GlowMetricCard
        label="Total Tax Owed"
        value={inView ? fmtTax(taxRaw) : fmt(0)}
        sub={`federal/national only`}
        icon="💸"
        gradient="linear-gradient(135deg,#4f46e5,#6366f1,#818cf8)"
        glowClass="glow-indigo"
        textColor="#818cf8"
      />
      <GlowMetricCard
        label="Effective Rate"
        value={inView ? fmtPct(effectRaw) : '0.00%'}
        sub="avg across all income"
        icon="📉"
        gradient="linear-gradient(135deg,#059669,#10b981,#34d399)"
        glowClass="glow-emerald"
        textColor="#34d399"
      />
      <GlowMetricCard
        label="Marginal Rate"
        value={inView ? fmtPct(marginalRaw) : '0.00%'}
        sub="on your next dollar"
        icon="📈"
        gradient="linear-gradient(135deg,#7c3aed,#8b5cf6,#a78bfa)"
        glowClass="glow-violet"
        textColor="#a78bfa"
      />
    </div>
  );
}

function GlowMetricCard({ label, value, sub, icon, gradient, glowClass, textColor }) {
  return (
    <div className={`metric-card ${glowClass}`}
      style={{ background: gradient }}>
      {/* Shimmer sweep overlay */}
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
function AnimatedBar({ breakdown, income, fmt, fmtCompact }) {
  const [ref, inView] = useInView(0.1);
  if (!breakdown.some(b => b.incomeInBracket > 0)) return null;

  return (
    <div className="space-y-2" ref={ref}>
      <div className="flex h-16 w-full gap-0.5 rounded-2xl overflow-hidden"
        style={{ backgroundColor:'rgba(148,163,184,0.2)' }}>
        {breakdown.map((b, i) => {
          if (b.incomeInBracket === 0) return null;
          const w = (b.incomeInBracket / income) * 100;
          return (
            <div key={i}
              className={`bar-segment relative group flex items-center justify-center overflow-visible hover:brightness-110 transition-all duration-300 ${inView ? 'bar-animate' : ''}`}
              style={{
                width: `${w}%`,
                backgroundColor: BRACKET_COLORS[i],
                flexShrink: 0,
                animationDelay: `${i * 0.08}s`,
              }}>
              {w > 5 && (
                <span className="text-xs font-bold text-white select-none pointer-events-none drop-shadow">
                  {(b.rate * 100).toFixed(0)}%
                </span>
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
      <div className="flex w-full">
        {breakdown.map((b, i) => {
          if (b.incomeInBracket === 0) return null;
          const w = (b.incomeInBracket / income) * 100;
          return (
            <div key={i} className="overflow-hidden" style={{ width:`${w}%` }}>
              {w > 10 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center truncate px-1 mt-1">
                  {fmtCompact(b.incomeInBracket)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Tax meter circular gauge ──────────────────────── */
function TaxMeterCard({ result, fmt, pct }) {
  const [ref, inView] = useInView(0.2);
  const r    = 52;
  const circ = 2 * Math.PI * r;
  const eff  = Math.min(result.effectiveRate, 1);
  const mar  = Math.min(result.marginalRate, 1);

  return (
    <div ref={ref} className="card p-6 flex flex-col items-center justify-center gap-5">
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tax Rates</p>

      {/* Effective rate ring */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Track */}
          <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="10"
            className="text-slate-200 dark:text-slate-800" />
          {/* Marginal (outer hint) */}
          <circle cx="60" cy="60" r={r} fill="none"
            stroke="rgba(168,85,247,0.25)" strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={inView ? circ * (1 - mar) : circ}
            strokeLinecap="round"
            style={{ transition:'stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1) 0.3s' }}
          />
          {/* Effective */}
          <circle cx="60" cy="60" r={r} fill="none"
            stroke="url(#gaugeGrad)" strokeWidth="10"
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

      {/* Legend */}
      <div className="w-full space-y-2.5 text-sm">
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
          <span className="text-xs text-slate-400 dark:text-slate-500">Tax saved vs marginal</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
            {pct(result.marginalRate - result.effectiveRate)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Take-home strip ───────────────────────────────── */
function TakeHomeStrip({ income, tax, fmt, pct, effectiveRate }) {
  const [ref, inView] = useInView();
  const takeHome = income - tax;

  const incomeAnim   = useCountUp(inView ? Math.round(income)    : 0, 1200);
  const taxAnim      = useCountUp(inView ? Math.round(tax)       : 0, 1300);
  const takeHomeAnim = useCountUp(inView ? Math.round(takeHome)  : 0, 1100);

  return (
    <section className="section-violet px-4 py-16">
      <div ref={ref} className={`reveal from-below max-w-4xl mx-auto ${inView ? 'visible' : ''}`}>
        <div className="relative rounded-2xl overflow-hidden"
          style={{ background:'linear-gradient(135deg,#4f46e5 0%,#7c3aed 35%,#db2777 70%,#f97316 100%)' }}>
          <div className="shimmer absolute inset-0 pointer-events-none" />
          <div className="relative z-10 px-8 py-10 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-7 flex items-center gap-2">
              <span className="coin-spin">💵</span> After-Tax Snapshot
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
              {[
                { label:'Gross Income', val: fmt(incomeAnim),   sub: null },
                { label:'Tax Paid',     val: fmt(taxAnim),      sub: `effective rate ${pct(effectiveRate)}` },
                { label:'Take-Home',    val: fmt(takeHomeAnim), sub: `${(100 - effectiveRate * 100).toFixed(1)}% of gross` },
              ].map(({ label, val, sub }) => (
                <div key={label}>
                  <p className="text-sm opacity-60 mb-1.5">{label}</p>
                  <p className="text-3xl sm:text-4xl font-extrabold font-mono">{val}</p>
                  {sub && <p className="text-xs opacity-40 mt-1.5">{sub}</p>}
                </div>
              ))}
            </div>
            {/* Time breakdowns */}
            <div className="border-t border-white/15 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Monthly',   val: fmt(Math.round(takeHome / 12)) },
                { label: 'Bi-Weekly', val: fmt(Math.round(takeHome / 26)) },
                { label: 'Weekly',    val: fmt(Math.round(takeHome / 52)) },
                { label: 'Daily',     val: fmt(Math.round(takeHome / 260)) },
              ].map(({ label, val }) => (
                <div key={label} className="text-center bg-white/10 rounded-xl px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">{label}</p>
                  <p className="text-base font-extrabold font-mono">{val}</p>
                </div>
              ))}
            </div>
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

/* ── Empty state ───────────────────────────────────── */
function EmptyState() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Preview cards */}
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-700 mb-8">
          Enter income above to unlock your full breakdown
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 opacity-40 pointer-events-none select-none">
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
        {/* Preview bar */}
        <div className="card p-6 opacity-35 pointer-events-none select-none">
          <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-700 mb-4" />
          <div className="flex h-12 gap-0.5 rounded-xl overflow-hidden">
            {[40, 25, 20, 15].map((w, i) => (
              <div key={i} className="rounded-sm"
                style={{ width: `${w}%`, background: BRACKET_COLORS[i], opacity: 0.7 }} />
            ))}
          </div>
          <div className="mt-4 flex gap-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: BRACKET_COLORS[i] }} />
                <div className="h-2 w-12 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
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
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const current = COUNTRIES[countryCode];

  useEffect(() => {
    const handler = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    const keyHandler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
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
      {/* Trigger */}
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

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700"
          style={{ background:'rgba(255,255,255,0.97)', backdropFilter:'blur(20px)', maxHeight:'420px', display:'flex', flexDirection:'column' }}>
          <style>{`.dark .country-dropdown{background:rgba(10,8,20,0.97)!important}`}</style>
          <div className="country-dropdown" style={{ display:'flex', flexDirection:'column', maxHeight:'420px' }}>
            {/* Search */}
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

            {/* List */}
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
                      const c = COUNTRIES[code];
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
