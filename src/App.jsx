import { useState, useEffect, useMemo } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from 'recharts';
import {
  calcAll, calcRaise, calcMarginalDollar, generateRateCurve,
  STATE_TAXES, STD_DEDUCTIONS, LIMITS, BRACKET_COLORS, FILING_STATUSES,
} from './usTaxUtils';
import { COUNTRIES, REGIONS, calculateTax } from './taxData';
import { VAT_COUNTRIES, VAT_REGIONS, calcVATRefund } from './vatData';

// ── Formatters ─────────────────────────────────────────────────────────────
// Regex-based to avoid OS locale interference (no Intl for USD — some environments
// produce narrow no-break spaces or wrong separators even with en-US specified).
const addCommas = (v) => Math.abs(Math.round(v)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const fmt  = (n) => { const v = Math.round(n || 0); return (v < 0 ? '-$' : '$') + addCommas(v); };
const fmtK = (n) => {
  const v = n || 0;
  if (Math.abs(v) >= 1_000_000) return `$${(Math.abs(v) / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 10_000)   return `$${(Math.abs(v) / 1_000).toFixed(0)}k`;
  return fmt(v);
};
const pct  = (n) => `${((n || 0) * 100).toFixed(1)}%`;

// ── State list ─────────────────────────────────────────────────────────────
const STATE_OPTIONS = Object.entries(STATE_TAXES)
  .sort(([, a], [, b]) => a.name.localeCompare(b.name))
  .map(([code, { name }]) => ({ code, name }));

// ── URL sync ───────────────────────────────────────────────────────────────
function readURL() {
  const p = new URLSearchParams(window.location.search);
  return {
    w2: Number(p.get('w2')) || 100000, ltcg: Number(p.get('ltcg')) || 0,
    qdivs: Number(p.get('qdivs')) || 0, se: Number(p.get('se')) || 0,
    k401: Number(p.get('k401')) || 0, hsa: Number(p.get('hsa')) || 0,
    ira: Number(p.get('ira')) || 0, std: p.get('std') !== 'false',
    iDed: Number(p.get('iDed')) || 0, fs: p.get('fs') || 'single', st: p.get('st') || 'NONE',
  };
}
function writeURL(vals) {
  const p = new URLSearchParams();
  Object.entries(vals).forEach(([k, v]) => { if (v || k === 'std') p.set(k, String(v)); });
  window.history.replaceState({}, '', `?${p}`);
}

// ── Design tokens ──────────────────────────────────────────────────────────
const cardBase = (dark) => `rounded-2xl border ${dark
  ? 'bg-slate-800/70 border-slate-700/60'
  : 'bg-white border-slate-200 shadow-sm'}`;

// ── Dollar input — formatted display when blurred ─────────────────────────
function DollarInput({ label, value, onChange, max, hint, dark }) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw]         = useState('');

  const handleFocus = () => { setFocused(true); setRaw(String(value)); };
  const commit = () => {
    const n = parseInt(raw.replace(/\D/g, ''), 10) || 0;
    const v = max ? Math.min(n, max) : n;
    onChange(v);
    setFocused(false);
  };

  const inputCls = `flex-1 bg-transparent outline-none w-full min-w-0 text-sm tabular-nums font-mono
    ${dark ? 'placeholder-slate-500' : 'placeholder-slate-300'}`;
  const borderCls = `flex items-center rounded-xl border px-3 py-2.5 transition-colors ${dark
    ? 'bg-slate-900/60 border-slate-600 text-white focus-within:border-indigo-500'
    : 'bg-white border-slate-200 text-slate-900 focus-within:border-indigo-400'}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-xs font-medium ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{label}</label>
      <div className={borderCls}>
        <span className={`text-sm select-none mr-1.5 font-mono ${dark ? 'text-slate-500' : 'text-slate-400'}`}>$</span>
        <input
          type="text" inputMode="numeric" className={inputCls}
          value={focused ? raw : addCommas(value || 0)}
          onFocus={handleFocus}
          onChange={e => setRaw(e.target.value.replace(/\D/g, ''))}
          onBlur={commit}
          onKeyDown={e => e.key === 'Enter' && commit()}
        />
      </div>
      {hint && <p className={`text-[11px] leading-relaxed ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{hint}</p>}
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────
function Card({ children, className = '', dark }) {
  return <div className={`${cardBase(dark)} p-4 md:p-5 ${className}`}>{children}</div>;
}

// ── Section label ──────────────────────────────────────────────────────────
function SLabel({ children, dark, className = '' }) {
  return (
    <h2 className={`text-[10px] font-semibold uppercase mb-3 ${dark ? 'text-slate-400' : 'text-slate-500'} ${className}`}
      style={{ letterSpacing: '0.07em', wordBreak: 'keep-all', overflowWrap: 'normal' }}>
      {children}
    </h2>
  );
}

// ── Toggle button group (filing status, deduction method, tabs) ─────────────
function ToggleBtn({ active, onClick, children, dark, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`border transition-all duration-150 text-xs font-semibold ${className} ${active
        ? 'bg-indigo-600 border-indigo-500 text-white'
        : dark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}>
      {children}
    </button>
  );
}

// ── Bracket bar ────────────────────────────────────────────────────────────
function BracketBar({ breakdown, ordinaryTaxable, dark }) {
  const total = ordinaryTaxable || 1;
  const segs  = breakdown.filter(b => b.inBracket > 0);
  if (!segs.length) {
    return (
      <div className={`h-12 rounded-xl flex items-center justify-center text-xs ${dark ? 'bg-slate-700/60 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
        No ordinary taxable income
      </div>
    );
  }
  return (
    <div className="flex h-12 rounded-xl overflow-hidden w-full gap-px">
      {segs.map((s, i) => (
        <div
          key={i}
          style={{ width: `${(s.inBracket / total) * 100}%`, background: BRACKET_COLORS[i] }}
          title={`${(s.rate * 100).toFixed(0)}% bracket: ${fmt(s.inBracket)} taxed → ${fmt(s.tax)}`}
          className="flex items-center justify-center transition-all duration-500">
          {s.inBracket / total > 0.08 && (
            <span className="text-white text-xs font-bold drop-shadow-sm">{(s.rate * 100).toFixed(0)}%</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Custom chart tooltip ───────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, dark }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-xl border p-3 text-xs shadow-xl ${dark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}>
      <p className={`font-semibold mb-1.5 ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{fmt(label)}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className={dark ? 'text-slate-400' : 'text-slate-500'}>{p.name}:</span>
          <span className="font-semibold tabular-nums whitespace-nowrap" style={{ color: p.color }}>
            {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Rate curve chart ───────────────────────────────────────────────────────
function RateCurve({ filingStatus, stateCode, currentIncome, dark }) {
  const maxIncome = Math.max(currentIncome * 1.5, 300000);
  const data = useMemo(
    () => generateRateCurve(filingStatus, maxIncome, stateCode, 2025, 80),
    [filingStatus, stateCode, maxIncome]
  );
  const tickStyle = { fill: dark ? '#94a3b8' : '#64748b', fontSize: 11 };
  // Fixed domain [0,50] — data is already in % (0–37 for federal). Clean 5% increments.
  const yTicks = [0, 10, 20, 30, 40, 50];
  return (
    <ResponsiveContainer width="100%" height={230}>
      <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#1e293b' : '#f1f5f9'} />
        <XAxis dataKey="income" tickFormatter={fmtK} tick={tickStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis
          tickFormatter={v => `${v}%`}
          tick={tickStyle}
          axisLine={false}
          tickLine={false}
          domain={[0, 50]}
          ticks={yTicks}
          width={44}
        />
        <Tooltip content={<ChartTooltip dark={dark} />} />
        <Line type="stepAfter" dataKey="marginal"  stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Marginal Fed" />
        <Line type="monotone"  dataKey="effective" stroke="#06b6d4" strokeWidth={2}   dot={false} name="Effective Fed" />
        <Line type="monotone"  dataKey="combined"  stroke="#8b5cf6" strokeWidth={1.5} dot={false} strokeDasharray="6 3" name="All-In" />
        <ReferenceLine x={Math.round(currentIncome)} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1.5}
          label={{ value: '▼', fill: '#ef4444', fontSize: 10, position: 'top' }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── Year compare chart ─────────────────────────────────────────────────────
function YearCompareChart({ filingStatus, currentIncome, dark }) {
  const maxIncome = Math.max(currentIncome * 1.5, 300000);
  const d25 = useMemo(() => generateRateCurve(filingStatus, maxIncome, 'NONE', 2025, 60), [filingStatus, maxIncome]);
  const d24 = useMemo(() => generateRateCurve(filingStatus, maxIncome, 'NONE', 2024, 60), [filingStatus, maxIncome]);
  const merged = d25.map((d, i) => ({ income: d.income, '2025': d.effective, '2024': d24[i]?.effective || 0 }));
  const tickStyle = { fill: dark ? '#94a3b8' : '#64748b', fontSize: 11 };
  const yTicks = [0, 5, 10, 15, 20, 25, 30];
  return (
    <ResponsiveContainer width="100%" height={210}>
      <ComposedChart data={merged} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#1e293b' : '#f1f5f9'} />
        <XAxis dataKey="income" tickFormatter={fmtK} tick={tickStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis
          tickFormatter={v => `${v}%`}
          tick={tickStyle}
          axisLine={false}
          tickLine={false}
          domain={[0, 30]}
          ticks={yTicks}
          width={44}
        />
        <Tooltip content={<ChartTooltip dark={dark} />} />
        <Line type="monotone" dataKey="2025" stroke="#10b981" strokeWidth={2}   dot={false} name="2025" />
        <Line type="monotone" dataKey="2024" stroke="#f59e0b" strokeWidth={2}   dot={false} strokeDasharray="6 3" name="2024" />
        <ReferenceLine x={Math.round(currentIncome)} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1.5} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── Welcome / Landing Page ────────────────────────────────────────────────
function WelcomePage({ onStart, dark, setDark }) {
  const muted = dark ? 'text-slate-400' : 'text-slate-500';
  const features = [
    {
      icon: '🇺🇸', mode: 'us',
      title: 'US Income Tax',
      desc: 'Federal + all 50 states · FICA · LTCG · SE tax · planning tools',
      grad: dark ? 'from-emerald-500/10 to-transparent' : 'from-emerald-50 to-transparent',
      border: dark ? 'border-emerald-500/25 hover:border-emerald-400/55' : 'border-emerald-200 hover:border-emerald-400',
    },
    {
      icon: '🌍', mode: 'global',
      title: 'World Income Tax',
      desc: 'Local currency · progressive bracket calculator · 83 countries',
      grad: dark ? 'from-blue-500/10 to-transparent' : 'from-blue-50 to-transparent',
      border: dark ? 'border-blue-500/25 hover:border-blue-400/55' : 'border-blue-200 hover:border-blue-400',
    },
    {
      icon: '🛍️', mode: 'vat',
      title: 'Tourist VAT Refund',
      desc: 'Airport refund calculator · min purchase check · claim guide',
      grad: dark ? 'from-violet-500/10 to-transparent' : 'from-violet-50 to-transparent',
      border: dark ? 'border-violet-500/25 hover:border-violet-400/55' : 'border-violet-200 hover:border-violet-400',
    },
  ];

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden ${dark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Mesh gradient */}
      <div className="absolute inset-0 hero-mesh pointer-events-none" />

      {/* Animated blobs */}
      <div className={`absolute top-20 -left-16 w-80 h-80 rounded-full blur-3xl blob blob-d1 pointer-events-none ${dark ? 'bg-violet-600/30' : 'bg-violet-300/50'}`} />
      <div className={`absolute bottom-28 -right-16 w-72 h-72 rounded-full blur-3xl blob2 blob-d3 pointer-events-none ${dark ? 'bg-indigo-600/25' : 'bg-indigo-300/45'}`} />
      <div className={`absolute top-1/2 left-1/2 w-56 h-56 rounded-full blur-3xl blob blob-d2 -translate-x-1/2 -translate-y-1/2 pointer-events-none ${dark ? 'bg-pink-600/15' : 'bg-pink-300/30'}`} />

      {/* Theme toggle */}
      <button
        onClick={() => setDark(d => !d)}
        className={`absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center rounded-xl border text-base transition-all ${dark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'}`}
        aria-label="Toggle theme">
        {dark ? '☀' : '☾'}
      </button>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 w-full max-w-md mx-auto">

        {/* Logo hero */}
        <div className="text-center mb-10">
          <span className="text-6xl coin-spin inline-block mb-4">💰</span>
          <h1 className="text-5xl font-black gradient-text" style={{ letterSpacing: '-0.02em' }}>TaxBracket</h1>
          <p className={`text-sm mt-3 leading-relaxed mx-auto ${muted}`} style={{ maxWidth: '22ch' }}>
            Calculate taxes & VAT refunds for any country in the world
          </p>
        </div>

        {/* Feature cards — each navigates to a mode */}
        <div className="w-full space-y-3 mb-8">
          {features.map(f => (
            <button key={f.mode} onClick={() => onStart(f.mode)}
              className={`w-full p-4 rounded-2xl border bg-gradient-to-r ${f.grad} ${f.border} transition-all duration-200 flex items-center gap-4 group text-left backdrop-blur-sm`}>
              <span className="text-3xl flex-shrink-0">{f.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <span className={`text-sm font-semibold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{f.title}</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${muted}`} style={{ wordBreak: 'normal', overflowWrap: 'normal' }}>{f.desc}</p>
              </div>
              <span className={`text-lg transition-transform duration-200 group-hover:translate-x-1 flex-shrink-0 ${muted}`}>›</span>
            </button>
          ))}
        </div>

        {/* Primary CTA */}
        <button onClick={() => onStart('us')}
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-base transition-all duration-150 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50">
          Get Started →
        </button>

        {/* Trust signals */}
        <div className={`mt-6 flex items-center justify-center gap-6 text-[11px] ${muted}`}>
          {['Free forever', 'No account needed', 'No ads'].map(t => (
            <span key={t} className="flex items-center gap-1">
              <span className="text-emerald-400">✓</span> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Mobile bottom navigation ───────────────────────────────────────────────
function BottomNav({ mode, setMode, dark }) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t backdrop-blur-md ${dark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'}`}>
      <div className="flex">
        {[
          { id: 'us',     icon: '🇺🇸', label: 'US Tax' },
          { id: 'global', icon: '🌍',   label: 'World' },
          { id: 'vat',    icon: '🛍️',   label: 'VAT' },
        ].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${
              mode === m.id
                ? 'text-indigo-400'
                : dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700'
            }`}>
            <span className="text-2xl leading-none">{m.icon}</span>
            <span className={`text-[10px] font-semibold mt-0.5 ${mode === m.id ? 'text-indigo-400' : ''}`}>{m.label}</span>
            {mode === m.id && (
              <span className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />
            )}
          </button>
        ))}
      </div>
      {/* iPhone home indicator safe area */}
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </div>
  );
}

// ── Global Income Tax Calculator ──────────────────────────────────────────
function GlobalIncomeTax({ dark }) {
  const [countryCode, setCountryCode] = useState('gb');
  const [income,      setIncome]      = useState(50000);
  const [filingSt,    setFilingSt]    = useState('individual');
  const [incFocused,  setIncFocused]  = useState(false);
  const [incRaw,      setIncRaw]      = useState('');

  const country  = COUNTRIES[countryCode] || COUNTRIES['gb'];
  const statuses = Object.entries(country?.statuses || {});

  useEffect(() => {
    const first = Object.keys(country?.statuses || {})[0];
    if (first) setFilingSt(first);
    const def = parseInt((country?.inputPlaceholder || '50000').replace(/[^0-9]/g, ''), 10) || 50000;
    setIncome(def);
  }, [countryCode]);

  const fmtLocal = (n) => {
    try {
      return new Intl.NumberFormat(country?.locale || 'en-US', {
        style: 'currency', currency: country?.currency || 'USD', maximumFractionDigits: 0,
      }).format(n || 0);
    } catch { return String(n || 0); }
  };

  const result = useMemo(() => {
    if (!country || !filingSt || !country.brackets?.[filingSt]) return null;
    try { return calculateTax(income, countryCode, filingSt); }
    catch { return null; }
  }, [income, countryCode, filingSt, country]);

  const adapted = result?.breakdown?.map(b => ({
    ...b, inBracket: b.incomeInBracket, tax: b.taxOwed,
  })) || [];

  const brackets  = country?.brackets?.[filingSt] || [];
  const sliderMax = Math.max(
    brackets.length >= 2 ? brackets[brackets.length - 2].max * 2 : 500000,
    income * 2, 1000
  );

  const muted    = dark ? 'text-slate-400' : 'text-slate-500';
  const divider  = dark ? 'border-slate-700/60' : 'border-slate-100';
  const inputCls = `flex items-center rounded-xl border px-3 py-2.5 transition-colors ${dark
    ? 'bg-slate-900/60 border-slate-600 text-white focus-within:border-indigo-500'
    : 'bg-white border-slate-200 text-slate-900 focus-within:border-indigo-400'}`;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-5">

      {/* KPI strip */}
      <div className={`rounded-2xl border p-5 ${dark
        ? 'bg-gradient-to-br from-slate-800/80 to-slate-800/40 border-slate-700/60'
        : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{country.flag}</span>
          <div>
            <p className={`text-sm font-semibold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{country.name}</p>
            <p className={`text-[11px] ${muted}`}>{country.note} · {country.year}</p>
          </div>
        </div>
        {result ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: 'Gross Income',   val: fmtLocal(income), color: dark ? 'text-slate-200' : 'text-slate-700', border: dark ? 'border-l-2 border-slate-500/60 pl-3' : 'border-l-2 border-slate-300 pl-3' },
              { label: 'Total Tax',      val: fmtLocal(result.totalTax), color: 'text-rose-400', border: dark ? 'border-l-2 border-rose-500/60 pl-3' : 'border-l-2 border-rose-400 pl-3' },
              { label: 'Effective Rate', val: `${(result.effectiveRate * 100).toFixed(1)}%`, color: 'text-cyan-400', border: dark ? 'border-l-2 border-cyan-500/60 pl-3' : 'border-l-2 border-cyan-400 pl-3' },
              { label: 'Take-Home',      val: fmtLocal(Math.max(0, income - result.totalTax)), color: 'text-emerald-400', border: dark ? 'border-l-2 border-emerald-500/60 pl-3' : 'border-l-2 border-emerald-400 pl-3' },
            ].map(item => (
              <div key={item.label} className={item.border}>
                <p className={`text-[11px] font-medium uppercase ${muted}`} style={{ letterSpacing: '0.06em', wordBreak: 'keep-all' }}>{item.label}</p>
                <p className={`text-xl font-bold tabular-nums font-mono mt-0.5 whitespace-nowrap ${item.color}`}>{item.val}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-xs ${muted}`}>Enter an income amount to see your tax estimate.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* LEFT: inputs */}
        <div className="lg:col-span-2 space-y-4">

          <Card dark={dark}>
            <SLabel dark={dark}>Country</SLabel>
            <select
              value={countryCode}
              onChange={e => setCountryCode(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl text-sm border outline-none cursor-pointer appearance-none transition-colors ${dark
                ? 'bg-slate-900/60 border-slate-600 text-white hover:border-slate-500'
                : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'}`}>
              {Object.entries(REGIONS).map(([region, codes]) => (
                <optgroup key={region} label={`── ${region}`}>
                  {codes.filter(c => COUNTRIES[c]).map(code => (
                    <option key={code} value={code}>
                      {COUNTRIES[code].flag}  {COUNTRIES[code].name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Card>

          {statuses.length > 1 && (
            <Card dark={dark}>
              <SLabel dark={dark}>Filing Status</SLabel>
              <div className="flex flex-wrap gap-2">
                {statuses.map(([key, s]) => (
                  <ToggleBtn key={key} active={filingSt === key}
                    onClick={() => setFilingSt(key)} dark={dark}
                    className="px-3 py-2 rounded-xl">
                    {s.icon && <span className="mr-1">{s.icon}</span>}{s.label}
                  </ToggleBtn>
                ))}
              </div>
            </Card>
          )}

          <Card dark={dark}>
            <SLabel dark={dark}>Annual Income ({country?.currency})</SLabel>
            <div className={inputCls}>
              <span className={`text-sm select-none mr-1.5 font-mono ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{country?.currency}</span>
              <input
                type="text" inputMode="numeric"
                className={`flex-1 bg-transparent outline-none w-full min-w-0 text-sm tabular-nums font-mono`}
                value={incFocused ? incRaw : addCommas(income || 0)}
                onFocus={() => { setIncFocused(true); setIncRaw(String(income)); }}
                onChange={e => setIncRaw(e.target.value.replace(/\D/g, ''))}
                onBlur={() => { setIncome(parseInt(incRaw.replace(/\D/g, ''), 10) || 0); setIncFocused(false); }}
                onKeyDown={e => { if (e.key === 'Enter') { setIncome(parseInt(incRaw.replace(/\D/g, ''), 10) || 0); setIncFocused(false); } }}
              />
            </div>
            <div className="mt-4">
              <input type="range" min={0} max={sliderMax} step={Math.max(1, Math.floor(sliderMax / 500))}
                value={income} onChange={e => setIncome(Number(e.target.value))}
                className="w-full" />
              <div className={`flex justify-between text-[10px] mt-1 ${muted}`}>
                <span>0</span>
                <span className="tabular-nums font-mono font-semibold text-cyan-400">{fmtLocal(income)}</span>
                <span>{fmtLocal(sliderMax)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: visualizations */}
        <div className="lg:col-span-3 space-y-4">
          {result ? (
            <>
              <Card dark={dark}>
                <SLabel dark={dark}>Tax Bracket Breakdown</SLabel>
                <BracketBar breakdown={adapted} ordinaryTaxable={income} dark={dark} />

                {adapted.filter(b => b.inBracket > 0).length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {adapted.filter(b => b.inBracket > 0).map((b, i) => (
                      <div key={i} className={`p-2.5 rounded-xl border ${dark ? 'bg-slate-900/50 border-slate-700/60' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: BRACKET_COLORS[i % BRACKET_COLORS.length] }} />
                          <span className="text-xs font-bold">{(b.rate * 100).toFixed(1)}% bracket</span>
                        </div>
                        <div className={`text-[11px] tabular-nums ${muted}`}>{fmtLocal(b.inBracket)}</div>
                        <div className="text-[11px] tabular-nums text-rose-400">tax: {fmtLocal(b.tax)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card dark={dark}>
                <SLabel dark={dark}>Full Bracket Detail</SLabel>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[380px]">
                    <thead>
                      <tr className={`border-b ${muted} ${divider}`}>
                        {['Rate', 'Range', 'In Bracket', 'Tax Owed'].map(h => (
                          <th key={h} className={`py-2 font-medium ${h === 'Rate' || h === 'Range' ? 'text-left' : 'text-right'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {adapted.filter(b => b.inBracket > 0).map((b, i) => (
                        <tr key={i} className={`border-b ${divider}`}>
                          <td className="py-2.5">
                            <span className="px-1.5 py-0.5 rounded text-[11px] font-bold text-white tabular-nums"
                              style={{ background: BRACKET_COLORS[i % BRACKET_COLORS.length] }}>
                              {(b.rate * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className={`py-2.5 tabular-nums ${muted}`}>
                            {fmtLocal(b.min)} – {b.max === Infinity ? '∞' : fmtLocal(b.max)}
                          </td>
                          <td className="text-right py-2.5 tabular-nums">{fmtLocal(b.inBracket)}</td>
                          <td className="text-right py-2.5 tabular-nums text-rose-400 font-semibold">{fmtLocal(b.tax)}</td>
                        </tr>
                      ))}
                      <tr className={`font-semibold text-xs ${dark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                        <td colSpan={2} className="py-3 rounded-l-lg pl-2">Total</td>
                        <td className="text-right py-3 tabular-nums">{fmtLocal(income)}</td>
                        <td className="text-right py-3 tabular-nums text-rose-400 rounded-r-lg pr-2">{fmtLocal(result.totalTax)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* summary row */}
                <div className={`mt-4 pt-4 border-t ${divider} grid grid-cols-3 gap-4 text-center`}>
                  {[
                    { label: 'Marginal Rate', val: `${(result.marginalRate * 100).toFixed(1)}%`, color: 'text-amber-400' },
                    { label: 'Effective Rate', val: `${(result.effectiveRate * 100).toFixed(1)}%`, color: 'text-cyan-400' },
                    { label: 'Take-Home', val: fmtLocal(Math.max(0, income - result.totalTax)), color: 'text-emerald-400' },
                  ].map(item => (
                    <div key={item.label}>
                      <p className={`text-xl font-bold tabular-nums font-mono whitespace-nowrap ${item.color}`}>{item.val}</p>
                      <p className={`text-[11px] mt-0.5 ${muted}`}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <div className={`rounded-2xl border p-10 text-center ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
              <p className={`text-sm ${muted}`}>Enter an income amount to see the tax breakdown</p>
            </div>
          )}
        </div>
      </div>

      <div className={`rounded-xl border p-4 text-[11px] leading-relaxed ${dark ? 'bg-slate-800/40 border-slate-700/60 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
        <p className={`font-semibold mb-1.5 text-xs ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Disclaimer</p>
        <p>National/federal income tax only — state, provincial, and local taxes are not included. Rates are simplified estimates from public tax schedules. Actual liability depends on deductions, credits, exemptions, and local rules. Always consult a qualified local tax professional for your specific situation.</p>
      </div>
    </div>
  );
}

// ── Tourist VAT Refund Calculator ─────────────────────────────────────────
function TouristVATRefund({ dark }) {
  const [countryCode,    setCountryCode]    = useState('DE');
  const [purchaseAmount, setPurchaseAmount] = useState(500);
  const [pFocused,       setPFocused]       = useState(false);
  const [pRaw,           setPRaw]           = useState('');

  const country = VAT_COUNTRIES[countryCode] || VAT_COUNTRIES['DE'];
  const refund  = (country?.hasRefund && purchaseAmount > 0) ? calcVATRefund(countryCode, purchaseAmount) : null;

  const fmtLocal = (n) =>
    `${country?.symbol || ''}${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const muted    = dark ? 'text-slate-400' : 'text-slate-500';
  const divider  = dark ? 'border-slate-700/60' : 'border-slate-100';
  const inputCls = `flex items-center rounded-xl border px-3 py-2.5 transition-colors ${dark
    ? 'bg-slate-900/60 border-slate-600 text-white focus-within:border-indigo-500'
    : 'bg-white border-slate-200 text-slate-900 focus-within:border-indigo-400'}`;

  const sliderMax = country?.hasRefund
    ? Math.max((country.minPurchase || 100) * 30, purchaseAmount * 2, 5000)
    : 10000;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-5">

      {/* Hero explainer */}
      <div className={`rounded-2xl border p-5 ${dark
        ? 'bg-gradient-to-br from-slate-800/80 to-slate-800/40 border-slate-700/60'
        : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🛍️</span>
          <p className={`text-sm font-semibold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>Tourist VAT / Tax Refund Calculator</p>
        </div>
        <p className={`text-xs leading-relaxed ${muted}`}>
          Most countries embed VAT (value-added tax) in the price of goods. As a tourist taking those goods home, you can claim that VAT back at the airport. Select your shopping destination, enter how much you spent, and see your estimated refund — plus step-by-step instructions to claim it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* LEFT: inputs */}
        <div className="lg:col-span-2 space-y-4">
          <Card dark={dark}>
            <SLabel dark={dark}>Shopping Destination</SLabel>
            <select
              value={countryCode}
              onChange={e => setCountryCode(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl text-sm border outline-none cursor-pointer appearance-none transition-colors ${dark
                ? 'bg-slate-900/60 border-slate-600 text-white hover:border-slate-500'
                : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'}`}>
              {Object.entries(VAT_REGIONS).map(([region, codes]) => (
                <optgroup key={region} label={`── ${region}`}>
                  {codes.filter(c => VAT_COUNTRIES[c]).map(code => {
                    const c = VAT_COUNTRIES[code];
                    return (
                      <option key={code} value={code}>
                        {c.flag}  {c.name}{!c.hasRefund ? ' ✗' : ''}
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </select>

            {country && (
              <div className={`mt-3 p-3 rounded-xl text-[11px] leading-relaxed border ${dark ? 'bg-slate-900/40 border-slate-700/60 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                {country.hasRefund ? (
                  <>
                    <div className="flex justify-between mb-1">
                      <span>Tax name</span>
                      <span className="font-semibold">{country.vatName}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Rate</span>
                      <span className="font-semibold text-amber-400">{(country.vatRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minimum purchase</span>
                      <span className="font-semibold whitespace-nowrap">{country.symbol}{addCommas(country.minPurchase || 0)}</span>
                    </div>
                  </>
                ) : (
                  <span className="text-rose-400 font-medium">No tourist refund program</span>
                )}
              </div>
            )}
          </Card>

          {country?.hasRefund && (
            <Card dark={dark}>
              <SLabel dark={dark}>Total Purchase Amount ({country.currency})</SLabel>
              <div className={inputCls}>
                <span className={`text-sm select-none mr-1.5 font-mono ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{country.symbol}</span>
                <input
                  type="text" inputMode="numeric"
                  className="flex-1 bg-transparent outline-none w-full min-w-0 text-sm tabular-nums font-mono"
                  value={pFocused ? pRaw : addCommas(purchaseAmount || 0)}
                  onFocus={() => { setPFocused(true); setPRaw(String(purchaseAmount)); }}
                  onChange={e => setPRaw(e.target.value.replace(/\D/g, ''))}
                  onBlur={() => { setPurchaseAmount(parseInt(pRaw.replace(/\D/g, ''), 10) || 0); setPFocused(false); }}
                  onKeyDown={e => { if (e.key === 'Enter') { setPurchaseAmount(parseInt(pRaw.replace(/\D/g, ''), 10) || 0); setPFocused(false); } }}
                />
              </div>
              <input type="range" min={0} max={sliderMax}
                step={Math.max(1, Math.floor(sliderMax / 500))}
                value={purchaseAmount} onChange={e => setPurchaseAmount(Number(e.target.value))}
                className="w-full mt-3" />
              <div className={`flex justify-between text-[10px] mt-1 ${muted}`}>
                <span>0</span>
                <span className="tabular-nums font-mono font-semibold whitespace-nowrap text-cyan-400">{country.symbol}{addCommas(purchaseAmount)}</span>
                <span className="whitespace-nowrap">{country.symbol}{addCommas(sliderMax)}</span>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT: results */}
        <div className="lg:col-span-3 space-y-4">

          {!country?.hasRefund ? (
            <div className={`rounded-2xl border p-6 ${dark ? 'bg-rose-950/30 border-rose-800/40' : 'bg-rose-50 border-rose-100'}`}>
              <div className="flex gap-3 items-start">
                <span className="text-3xl mt-0.5">🚫</span>
                <div>
                  <p className={`font-semibold mb-2 ${dark ? 'text-rose-300' : 'text-rose-700'}`}>No Refund Program — {country?.name}</p>
                  <p className={`text-xs leading-relaxed ${dark ? 'text-rose-400' : 'text-rose-600'}`}>{country?.noRefundReason}</p>
                </div>
              </div>
            </div>
          ) : !refund ? (
            <div className={`rounded-2xl border p-10 text-center ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
              <p className={`text-sm ${muted}`}>Enter your purchase amount to see the refund estimate</p>
            </div>
          ) : (
            <>
              {/* Below-minimum warning */}
              {refund.belowMin && (
                <div className={`rounded-xl border p-4 flex gap-3 items-start ${dark ? 'bg-amber-950/30 border-amber-700/40' : 'bg-amber-50 border-amber-200'}`}>
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className={`text-xs font-semibold ${dark ? 'text-amber-300' : 'text-amber-700'}`}>Below minimum purchase threshold</p>
                    <p className={`text-[11px] mt-0.5 ${dark ? 'text-amber-400' : 'text-amber-600'}`}>
                      You need to spend at least {country.symbol}{country.minPurchase.toLocaleString()} from a single retailer in one day to qualify for a refund in {country.name}.
                    </p>
                  </div>
                </div>
              )}

              {/* Refund breakdown card */}
              <Card dark={dark}>
                <SLabel dark={dark}>Estimated Refund — {country.flag} {country.name}</SLabel>
                <div className="space-y-3.5">
                  {[
                    { label: `Purchase price (${country.vatName} included)`, val: fmtLocal(purchaseAmount), color: dark ? 'text-slate-300' : 'text-slate-700' },
                    { label: `${country.vatName} embedded (${(country.vatRate * 100).toFixed(1)}% rate)`, val: fmtLocal(refund.embedded), color: 'text-amber-400' },
                    { label: `Processing fee (~${Math.round((1 - country.netRefundFraction) * 100)}% of VAT)`, val: `−${fmtLocal(refund.fee)}`, color: 'text-rose-400' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className={`text-xs ${muted}`}>{row.label}</span>
                      <span className={`tabular-nums font-mono font-semibold text-sm whitespace-nowrap ${row.color}`}>{row.val}</span>
                    </div>
                  ))}

                  <div className={`flex justify-between items-center pt-3 border-t ${divider}`}>
                    <span className={`text-sm font-semibold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>Estimated Net Refund</span>
                    <span className="text-3xl font-bold tabular-nums font-mono whitespace-nowrap text-emerald-400">{fmtLocal(refund.netRefund)}</span>
                  </div>
                  <div className={`flex justify-between text-[11px] ${muted}`}>
                    <span>Refund as % of purchase price</span>
                    <span className="font-semibold text-emerald-400">{(refund.refundPct * 100).toFixed(1)}%</span>
                  </div>

                  {/* Refund bar */}
                  <div>
                    <div className={`h-3 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(refund.refundPct * 10 * 100, 100)}%` }} />
                    </div>
                    <p className={`text-[10px] mt-1 ${muted}`}>Bar scale: 10% of purchase = full</p>
                  </div>
                </div>

                <div className={`mt-4 pt-4 border-t ${divider} space-y-1.5 text-[11px] ${muted}`}>
                  <p><span className="font-medium">Refund operator:</span> {country.operator}</p>
                  <p><span className="font-medium">Where to claim:</span> {country.claimAt}</p>
                </div>
              </Card>

              {/* How to claim */}
              <Card dark={dark}>
                <SLabel dark={dark}>How to Claim Your Refund — Step by Step</SLabel>
                <ol className="space-y-3">
                  {country.steps?.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${dark ? 'bg-indigo-900/60 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>
                        {i + 1}
                      </span>
                      <span className={`text-xs leading-relaxed pt-0.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{step}</span>
                    </li>
                  ))}
                </ol>
                {country.note && (
                  <div className={`mt-4 p-3 rounded-xl text-[11px] leading-relaxed border ${dark ? 'bg-amber-950/20 border-amber-800/30 text-amber-300' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                    <span className="font-semibold">Note: </span>{country.note}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>

      <div className={`rounded-xl border p-4 text-[11px] leading-relaxed ${dark ? 'bg-slate-800/40 border-slate-700/60 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
        <p className={`font-semibold mb-1.5 text-xs ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Disclaimer</p>
        <p>VAT refund estimates are approximate. Actual refunds depend on the specific retailer, tax-free operator, exchange rates, and eligibility. Processing fees shown are averages and vary by operator and form type. Rules, minimum thresholds, and eligible goods change frequently — always verify with official sources or the retailer before shopping.</p>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const init = readURL();
  const [hasStarted, setHasStarted] = useState(() => sessionStorage.getItem('tb_v1') === '1');
  const [mode, setMode] = useState('us');
  const [dark, setDark] = useState(true);

  const handleStart = (m = 'us') => {
    setMode(m);
    sessionStorage.setItem('tb_v1', '1');
    setHasStarted(true);
  };

  const [w2Income,      setW2Income]      = useState(init.w2);
  const [ltcgIncome,    setLtcgIncome]    = useState(init.ltcg);
  const [qualifiedDivs, setQualifiedDivs] = useState(init.qdivs);
  const [seIncome,      setSeIncome]      = useState(init.se);

  const [k401,    setK401]    = useState(init.k401);
  const [hsa,     setHsa]     = useState(init.hsa);
  const [ira,     setIra]     = useState(init.ira);
  const [useStd,  setUseStd]  = useState(init.std !== false);
  const [itemized,setItemized]= useState(init.iDed);

  const [filingStatus, setFilingStatus] = useState(init.fs);
  const [stateCode,    setStateCode]    = useState(init.st);

  const [planningTab, setPlanningTab] = useState('raise');
  const [raiseAmount, setRaiseAmount] = useState(10000);
  const [scenario2,   setScenario2]   = useState(150000);
  const [shareCopied, setShareCopied] = useState(false);
  const [copied,      setCopied]      = useState(false);

  useEffect(() => {
    writeURL({ w2: w2Income, ltcg: ltcgIncome, qdivs: qualifiedDivs, se: seIncome,
      k401, hsa, ira, std: useStd, iDed: itemized, fs: filingStatus, st: stateCode });
  }, [w2Income, ltcgIncome, qualifiedDivs, seIncome, k401, hsa, ira, useStd, itemized, filingStatus, stateCode]);

  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);

  const inputs = useMemo(() => ({
    w2Income, ltcgIncome, qualifiedDivs, seIncome,
    k401, hsa, ira, useStdDeduction: useStd, itemizedDeduction: itemized,
    filingStatus, stateCode,
  }), [w2Income, ltcgIncome, qualifiedDivs, seIncome, k401, hsa, ira, useStd, itemized, filingStatus, stateCode]);

  const result           = useMemo(() => calcAll(inputs),                                            [inputs]);
  const grossIncome      = w2Income + ltcgIncome + qualifiedDivs + seIncome;
  const statusComparison = useMemo(() => Object.keys(FILING_STATUSES).map(fs => ({ fs, ...calcAll({ ...inputs, filingStatus: fs }) })), [inputs]);
  const raiseResult      = useMemo(() => calcRaise(inputs, raiseAmount),                             [inputs, raiseAmount]);
  const marginal1k       = useMemo(() => calcMarginalDollar(inputs, 1000),                           [inputs]);
  const scenario2Result  = useMemo(() => calcAll({ ...inputs, w2Income: scenario2 }),                [inputs, scenario2]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleCopyBreakdown = () => {
    const lines = [
      `Tax Breakdown — ${FILING_STATUSES[filingStatus].label}`,
      `Gross Income:       ${fmt(grossIncome)}`,
      `Pre-Tax Deductions: ${fmt(result.preTax)}`,
      `AGI:                ${fmt(result.agi)}`,
      `Deduction:          ${fmt(result.deduction)}`,
      `Ordinary Taxable:   ${fmt(result.ordinaryTaxable)}`,
      ``,
      `Federal Tax:        ${fmt(result.totalFedTax)}`,
      `  Marginal Rate:    ${pct(result.marginalRate)}`,
      `  Effective Rate:   ${pct(result.effectiveRate)}`,
      `FICA (SS+Medicare): ${fmt(result.fica.totalFICA)}`,
      `State Tax (${stateCode}): ${fmt(result.stateTax.tax)}`,
      `Total Tax:          ${fmt(result.totalTax)}`,
      `Take-Home:          ${fmt(result.takeHome)}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const lines = [
        'US Federal Tax Summary (2025)', '',
        `Filing Status: ${FILING_STATUSES[filingStatus].label}`,
        `State: ${STATE_TAXES[stateCode]?.name || 'None'}`, '',
        'INCOME',
        `  W-2 / Salary:        ${fmt(w2Income)}`,
        `  LTCG:                ${fmt(ltcgIncome)}`,
        `  Qualified Dividends: ${fmt(qualifiedDivs)}`,
        `  Self-Employment:     ${fmt(seIncome)}`,
        `  Gross Income:        ${fmt(grossIncome)}`, '',
        'DEDUCTIONS',
        `  401(k):              ${fmt(k401)}`,
        `  HSA:                 ${fmt(hsa)}`,
        `  Traditional IRA:     ${fmt(ira)}`,
        `  Standard Deduction:  ${fmt(result.stdDed)}`,
        `  AGI:                 ${fmt(result.agi)}`,
        `  Taxable Income:      ${fmt(result.ordinaryTaxable)}`, '',
        'FEDERAL TAX BRACKETS',
        ...result.fedOrdinary.breakdown.filter(b => b.inBracket > 0).map(b =>
          `  ${(b.rate * 100).toFixed(0)}% on ${fmt(b.inBracket)} = ${fmt(b.tax)}`),
        `  LTCG Tax:            ${fmt(result.ltcgTax.totalTax)}`,
        `  Total Federal:       ${fmt(result.totalFedTax)}`,
        `  Marginal Rate:       ${pct(result.marginalRate)}`,
        `  Effective Rate:      ${pct(result.effectiveRate)}`, '',
        'FICA',
        `  Social Security:     ${fmt(result.fica.w2SS + result.fica.seSS)}`,
        `  Medicare:            ${fmt(result.fica.w2Medicare + result.fica.seMedicare)}`,
        `  Additional Medicare: ${fmt(result.fica.addMedicare)}`,
        `  Total FICA:          ${fmt(result.fica.totalFICA)}`, '',
        `STATE TAX (${STATE_TAXES[stateCode]?.name}): ${fmt(result.stateTax.tax)}`, '',
        `TOTAL TAX:  ${fmt(result.totalTax)}`,
        `TAKE-HOME:  ${fmt(result.takeHome)}`, '',
        `Generated ${new Date().toLocaleDateString()}`,
      ];
      doc.setFont('courier', 'normal');
      doc.setFontSize(10);
      lines.forEach((line, i) => doc.text(line, 15, 15 + i * 6));
      doc.save('tax-summary-2025.pdf');
    } catch (e) { console.error('PDF export failed:', e); }
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
  const muted   = dark ? 'text-slate-400' : 'text-slate-500';
  const divider = dark ? 'border-slate-700/60' : 'border-slate-100';

  if (!hasStarted) {
    return (
      <div className={`min-h-screen ${dark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <WelcomePage onStart={handleStart} dark={dark} setDark={setDark} />
      </div>
    );
  }

  return (
    // Root uses Inter (sans-serif from index.css `* {}`) not monospace
    <div className={`min-h-screen transition-colors ${dark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-sm ${dark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 md:px-6 xl:px-8 h-14 flex items-center justify-between gap-2">
          {/* Logo */}
          <span className="text-base font-bold tracking-tight text-emerald-400 flex-shrink-0">TaxBracket</span>

          {/* Mode tabs — center (hidden on mobile, bottom nav handles it) */}
          <div className="hidden sm:flex items-center gap-1">
            {[
              { id: 'us',     label: '🇺🇸 US Tax' },
              { id: 'global', label: '🌍 World Tax' },
              { id: 'vat',    label: '🛍️ VAT Refund' },
            ].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  mode === m.id
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : dark
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {mode === 'us' && (
              <button onClick={handleShare}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all hidden sm:block ${dark
                  ? 'border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-indigo-300'
                  : 'border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'}`}>
                {shareCopied ? 'Copied!' : 'Share'}
              </button>
            )}
            <button
              onClick={() => setDark(d => !d)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border text-base transition-all ${dark
                ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'}`}
              aria-label="Toggle theme">
              {dark ? '☀' : '☾'}
            </button>
          </div>
        </div>
      </header>

      {/* pb-20 sm:pb-0 leaves room for fixed bottom nav on mobile */}
      <div className="pb-20 sm:pb-0">
      {mode === 'us' && (
      <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 md:px-6 xl:px-8 py-6 space-y-6">

        {/* ── KPI Hero Strip ───────────────────────────────────────────── */}
        <div className={`rounded-2xl border p-5 ${dark
          ? 'bg-gradient-to-br from-slate-800/80 to-slate-800/40 border-slate-700/60'
          : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              {
                label: 'Take-Home Pay',
                val: fmt(result.takeHome),
                sub: `${pct(grossIncome > 0 ? result.takeHome / grossIncome : 0)} of gross`,
                color: 'text-emerald-400',
                border: dark ? 'border-l-2 border-emerald-500/60 pl-3' : 'border-l-2 border-emerald-400 pl-3',
              },
              {
                label: 'Total Tax Burden',
                val: fmt(result.totalTax),
                sub: `${pct(grossIncome > 0 ? result.totalTax / grossIncome : 0)} all-in`,
                color: 'text-rose-400',
                border: dark ? 'border-l-2 border-rose-500/60 pl-3' : 'border-l-2 border-rose-400 pl-3',
              },
              {
                label: 'Marginal Rate',
                val: pct(result.marginalRate),
                sub: 'Next $1 of ordinary income',
                color: 'text-amber-400',
                border: dark ? 'border-l-2 border-amber-500/60 pl-3' : 'border-l-2 border-amber-400 pl-3',
              },
              {
                label: 'Federal Effective',
                val: pct(result.effectiveRate),
                sub: 'Federal income tax only',
                color: 'text-cyan-400',
                border: dark ? 'border-l-2 border-cyan-500/60 pl-3' : 'border-l-2 border-cyan-400 pl-3',
              },
            ].map(item => (
              <div key={item.label} className={item.border}>
                <p className={`text-[10px] font-medium uppercase ${muted}`} style={{ letterSpacing: '0.06em', wordBreak: 'keep-all' }}>{item.label}</p>
                <p className={`text-2xl font-bold tabular-nums font-mono mt-1 whitespace-nowrap ${item.color}`}>{item.val}</p>
                <p className={`text-[11px] mt-0.5 whitespace-nowrap ${muted}`}>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Two-column layout ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* LEFT: Inputs */}
          <div className="lg:col-span-2 space-y-4">

            {/* Income breakdown */}
            <Card dark={dark}>
              <SLabel dark={dark}>Income</SLabel>
              <div className="space-y-3">
                <DollarInput label="W-2 / Salary" value={w2Income} onChange={setW2Income} dark={dark}
                  hint="Ordinary income tax + 7.65% FICA" />
                <DollarInput label="Long-Term Capital Gains" value={ltcgIncome} onChange={setLtcgIncome} dark={dark}
                  hint="Preferential 0 / 15 / 20% rates" />
                <DollarInput label="Qualified Dividends" value={qualifiedDivs} onChange={setQualifiedDivs} dark={dark}
                  hint="Same rates as LTCG" />
                <DollarInput label="Freelance / Self-Employment" value={seIncome} onChange={setSeIncome} dark={dark}
                  hint="15.3% SE tax on 92.35% of net income" />
              </div>

              {/* W-2 slider */}
              <div className={`mt-4 pt-4 border-t ${divider}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-[11px] font-medium ${muted}`}>W-2 Income Slider</label>
                  <span className="text-xs font-bold tabular-nums font-mono text-emerald-400">{fmt(w2Income)}</span>
                </div>
                <input type="range" min={0} max={1000000} step={1000} value={w2Income}
                  onChange={e => setW2Income(Number(e.target.value))}
                  className="w-full" />
                <div className={`flex justify-between text-[10px] mt-1 ${muted}`}>
                  <span>$0</span><span>$500k</span><span>$1M</span>
                </div>
              </div>
            </Card>

            {/* Pre-tax deductions */}
            <Card dark={dark}>
              <SLabel dark={dark}>Pre-Tax Deductions</SLabel>
              <div className="space-y-3">
                <DollarInput label={`401(k) — 2025 max ${fmt(LIMITS.k401)}`} value={k401}
                  onChange={setK401} max={LIMITS.k401} dark={dark} />
                <DollarInput label={`HSA — max ${fmt(LIMITS.hsa_self)} (self-only)`} value={hsa}
                  onChange={setHsa} max={LIMITS.hsa_family} dark={dark} />
                <DollarInput label={`Traditional IRA — max ${fmt(LIMITS.ira)}`} value={ira}
                  onChange={setIra} max={LIMITS.ira} dark={dark} />
              </div>
              {result.preTax > 0 && (
                <div className={`mt-3 p-3 rounded-xl text-[11px] leading-relaxed ${dark ? 'bg-emerald-950/40 border border-emerald-800/30 text-emerald-300' : 'bg-emerald-50 border border-emerald-100 text-emerald-800'}`}>
                  These contributions reduce your taxable income by{' '}
                  <span className="font-semibold tabular-nums whitespace-nowrap">{fmt(result.preTax)}</span>, saving ~<span className="font-semibold tabular-nums whitespace-nowrap">{fmt(result.preTax * result.marginalRate)}</span>{' '}
                  in federal tax at your <span className="font-semibold tabular-nums whitespace-nowrap">{pct(result.marginalRate)}</span> marginal rate.
                </div>
              )}
            </Card>

            {/* Deduction method */}
            <Card dark={dark}>
              <SLabel dark={dark}>Deduction Method</SLabel>
              <div className="flex gap-2 mb-2">
                <ToggleBtn active={useStd} onClick={() => setUseStd(true)} dark={dark}
                  className="flex-1 py-2 rounded-xl">
                  Standard ({fmt(result.stdDed)})
                </ToggleBtn>
                <ToggleBtn active={!useStd} onClick={() => setUseStd(false)} dark={dark}
                  className="flex-1 py-2 rounded-xl">
                  Itemized
                </ToggleBtn>
              </div>
              {!useStd && (
                <div className="mt-2">
                  <DollarInput label="Itemized Total" value={itemized} onChange={setItemized} dark={dark}
                    hint={`Only beneficial above ${fmt(result.stdDed)}`} />
                </div>
              )}
              <p className={`mt-2 text-[11px] ${muted}`}>
                Deduction applied: <span className="text-emerald-400 font-semibold tabular-nums font-mono">{fmt(result.deduction)}</span>
              </p>
            </Card>

            {/* Filing status + state */}
            <Card dark={dark}>
              <SLabel dark={dark}>Filing Status</SLabel>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(FILING_STATUSES).map(([fs, { label, icon }]) => (
                  <ToggleBtn key={fs} active={filingStatus === fs} onClick={() => setFilingStatus(fs)} dark={dark}
                    className="py-2.5 rounded-xl text-center flex flex-col items-center gap-0.5">
                    <span className="text-sm">{icon}</span>
                    <span className="text-[10px] leading-tight">{label.split(' ').slice(0, 2).join(' ')}</span>
                  </ToggleBtn>
                ))}
              </div>

              <div className={`mt-4 pt-4 border-t ${divider}`}>
                <SLabel dark={dark}>State Tax</SLabel>
                <select value={stateCode} onChange={e => setStateCode(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm border outline-none cursor-pointer appearance-none transition-colors ${dark
                    ? 'bg-slate-900/60 border-slate-600 text-white hover:border-slate-500'
                    : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'}`}>
                  {STATE_OPTIONS.map(({ code, name }) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
                {stateCode !== 'NONE' && result.stateTax.tax > 0 && (
                  <p className={`mt-1.5 text-[11px] ${muted}`}>
                    Est. state tax:{' '}
                    <span className="text-violet-400 font-semibold tabular-nums whitespace-nowrap">{fmt(result.stateTax.tax)}</span>
                    {' '}(<span className="whitespace-nowrap">{pct(result.stateTax.rate)} eff.</span>)
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT: Visualizations */}
          <div className="lg:col-span-3 space-y-4">

            {/* Bracket breakdown */}
            <Card dark={dark}>
              <SLabel dark={dark}>Federal Bracket Breakdown</SLabel>
              <BracketBar breakdown={result.fedOrdinary.breakdown} ordinaryTaxable={result.ordinaryTaxable} dark={dark} />

              {/* Bracket detail cards */}
              {result.fedOrdinary.breakdown.filter(b => b.inBracket > 0).length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {result.fedOrdinary.breakdown.filter(b => b.inBracket > 0).map((b, i) => (
                    <div key={i} className={`p-2.5 rounded-xl border ${dark ? 'bg-slate-900/50 border-slate-700/60' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: BRACKET_COLORS[i] }} />
                        <span className="text-xs font-bold">{(b.rate * 100).toFixed(0)}% bracket</span>
                      </div>
                      <div className={`text-[11px] tabular-nums ${muted}`}>{fmt(b.inBracket)}</div>
                      <div className="text-[11px] tabular-nums text-rose-400 font-medium">tax: {fmt(b.tax)}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Income waterfall */}
              <div className={`mt-4 pt-4 border-t ${divider} space-y-1.5`}>
                {[
                  { label: 'Gross Income',        val: grossIncome,              indent: 0, color: dark ? 'text-slate-100' : 'text-slate-800' },
                  { label: '− Pre-Tax Deductions',val: result.preTax,            indent: 1, color: 'text-amber-400', neg: true },
                  { label: '= Adjusted Gross Income', val: result.agi,           indent: 0, color: 'text-sky-400' },
                  { label: '− Standard Deduction', val: result.deduction,        indent: 1, color: 'text-amber-400', neg: true },
                  { label: '= Ordinary Taxable Income', val: result.ordinaryTaxable, indent: 0, color: 'text-emerald-400' },
                ].map(row => (
                  <div key={row.label} className={`flex justify-between items-center gap-3 text-xs ${row.indent ? 'pl-3' : ''}`}>
                    <span className={`min-w-0 ${row.indent ? muted : (dark ? 'text-slate-300' : 'text-slate-700')}`}>{row.label}</span>
                    <span className={`font-semibold tabular-nums whitespace-nowrap flex-shrink-0 ${row.color}`}>
                      {row.neg ? `(${fmt(row.val)})` : fmt(row.val)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Rate curve */}
            <Card dark={dark}>
              <div className="flex items-start justify-between mb-3">
                <SLabel dark={dark} className="mb-0">Marginal vs. Effective Rate Curve</SLabel>
              </div>
              <RateCurve filingStatus={filingStatus} stateCode={stateCode}
                currentIncome={grossIncome || 100000} dark={dark} />
              <div className={`flex flex-wrap gap-x-5 gap-y-1 mt-2 text-[11px] ${muted}`}>
                <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 bg-amber-400 rounded" />Marginal (federal)</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 bg-cyan-400 rounded" />Effective (federal)</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 border-t-2 border-dashed border-violet-400" />All-in</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-0.5 h-3 bg-red-400" />Your income</span>
              </div>
            </Card>

            {/* Where your money goes */}
            <Card dark={dark}>
              <SLabel dark={dark}>Where Your Money Goes</SLabel>
              <div className="space-y-3">
                {[
                  { label: 'Federal Income Tax',     val: result.totalFedTax,                                                               color: '#ef4444', hex: 'text-rose-400' },
                  { label: 'Social Security',        val: result.fica.w2SS + result.fica.seSS,                                             color: '#f97316', hex: 'text-orange-400' },
                  { label: 'Medicare',               val: result.fica.w2Medicare + result.fica.seMedicare + result.fica.addMedicare,       color: '#f59e0b', hex: 'text-amber-400' },
                  { label: `State Tax${stateCode !== 'NONE' ? ` (${STATE_TAXES[stateCode]?.name})` : ''}`, val: result.stateTax.tax,       color: '#8b5cf6', hex: 'text-violet-400' },
                  { label: 'Pre-Tax Contributions',  val: Math.max(0, result.preTax - result.fica.seDeduction),                           color: '#06b6d4', hex: 'text-cyan-400' },
                  { label: 'Take-Home Pay',           val: result.takeHome,                                                                color: '#22c55e', hex: 'text-emerald-400' },
                ].filter(item => item.val > 0).map(item => {
                  const share = grossIncome > 0 ? item.val / grossIncome : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                          <span className={`truncate ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{item.label}</span>
                        </div>
                        <div className={`flex items-center gap-2 flex-shrink-0 ml-2`}>
                          <span className={`tabular-nums font-mono font-semibold whitespace-nowrap ${item.hex}`}>{fmt(item.val)}</span>
                          <span className={`tabular-nums w-10 text-right whitespace-nowrap ${muted}`}>{pct(share)}</span>
                        </div>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${dark ? 'bg-slate-700/60' : 'bg-slate-100'}`}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${share * 100}%`, background: item.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {seIncome > 0 && (
                <div className={`mt-4 p-3 rounded-xl text-xs border ${dark ? 'bg-slate-900/50 border-slate-700/60' : 'bg-slate-50 border-slate-100'}`}>
                  <p className="font-semibold text-amber-400 mb-2">Self-Employment Tax Detail</p>
                  {[
                    ['SS tax (12.4% × 92.35%)',       result.fica.seSS,            ''],
                    ['Medicare tax (2.9% × 92.35%)',  result.fica.seMedicare,       ''],
                    ['Deductible half (reduces AGI)', -result.fica.seDeduction,     'text-emerald-400'],
                  ].map(([label, val, cls]) => (
                    <div key={label} className="flex justify-between">
                      <span className={muted}>{label}</span>
                      <span className={`tabular-nums font-mono whitespace-nowrap ${cls}`}>{val < 0 ? `−${fmt(-val)}` : fmt(val)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* ── Filing Status Comparison ─────────────────────────────────── */}
        <Card dark={dark}>
          <SLabel dark={dark}>Filing Status Comparison — Same Income</SLabel>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className={`text-[11px] border-b ${muted} ${divider}`}>
                  <th className="text-left py-2 pl-1 font-medium">Status</th>
                  <th className="text-right py-2 font-medium hidden sm:table-cell">Std Deduction</th>
                  <th className="text-right py-2 font-medium">Federal Tax</th>
                  <th className="text-right py-2 font-medium hidden md:table-cell">Effective Rate</th>
                  <th className="text-right py-2 font-medium hidden sm:table-cell">Marginal Rate</th>
                  <th className="text-right py-2 pr-1 font-medium">Take-Home</th>
                </tr>
              </thead>
              <tbody>
                {statusComparison.map(({ fs, totalFedTax, effectiveRate, marginalRate, takeHome, stdDed }) => {
                  const isActive = fs === filingStatus;
                  return (
                    <tr key={fs} onClick={() => setFilingStatus(fs)}
                      className={`border-b cursor-pointer transition-colors ${divider}
                        ${isActive
                          ? dark ? 'bg-indigo-950/40' : 'bg-indigo-50/60'
                          : dark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}
                        ${isActive ? 'table-row-active' : ''}`}
                      style={isActive ? { '--row-accent': '#6366f1' } : {}}>
                      <td className="py-3 pl-1">
                        <div className="flex items-center gap-2">
                          <span>{FILING_STATUSES[fs].icon}</span>
                          <span className={`font-medium text-xs ${isActive ? 'text-indigo-400' : ''}`}>{FILING_STATUSES[fs].label}</span>
                          {isActive && <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${dark ? 'bg-indigo-900/60 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>current</span>}
                        </div>
                      </td>
                      <td className="text-right py-3 tabular-nums text-amber-400 text-xs hidden sm:table-cell">{fmt(stdDed)}</td>
                      <td className="text-right py-3 tabular-nums text-rose-400 text-xs font-medium">{fmt(totalFedTax)}</td>
                      <td className="text-right py-3 tabular-nums text-cyan-400 text-xs hidden md:table-cell">{pct(effectiveRate)}</td>
                      <td className="text-right py-3 tabular-nums text-amber-400 text-xs hidden sm:table-cell">{pct(marginalRate)}</td>
                      <td className="text-right py-3 pr-1 tabular-nums text-emerald-400 text-xs font-semibold">{fmt(takeHome)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── Planning Tools ───────────────────────────────────────────── */}
        <Card dark={dark}>
          <SLabel dark={dark}>Planning Tools</SLabel>
          <div className="flex gap-2 mb-5 flex-wrap">
            {[
              { id: 'raise',    label: 'Raise Simulator' },
              { id: 'marginal', label: 'Next $1,000' },
              { id: 'whatif',   label: 'What-If Scenario' },
              { id: 'yearcomp', label: '2024 vs 2025' },
            ].map(tab => (
              <ToggleBtn key={tab.id} active={planningTab === tab.id}
                onClick={() => setPlanningTab(tab.id)} dark={dark}
                className="px-4 py-2 rounded-xl">
                {tab.label}
              </ToggleBtn>
            ))}
          </div>

          {/* Raise Simulator */}
          {planningTab === 'raise' && (
            <div className="space-y-4">
              <div>
                <DollarInput label="If I earn this much more..." value={raiseAmount} onChange={setRaiseAmount} dark={dark} />
                <input type="range" min={1000} max={200000} step={1000} value={raiseAmount}
                  onChange={e => setRaiseAmount(Number(e.target.value))}
                  className="w-full mt-3" />
                <div className={`flex justify-between text-[10px] mt-0.5 ${muted}`}>
                  <span>$1,000</span><span className="tabular-nums font-mono font-semibold text-cyan-400">{fmt(raiseAmount)}</span><span>$200,000</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Gross Raise',  val: fmt(raiseResult.grossRaise),  color: dark ? 'text-slate-200' : 'text-slate-800' },
                  { label: 'Extra Tax',    val: fmt(raiseResult.extraTax),    color: 'text-rose-400' },
                  { label: 'You Keep',     val: fmt(raiseResult.keepAmount),  color: 'text-emerald-400' },
                  { label: 'Keep Rate',    val: pct(raiseResult.keepPct),     color: 'text-cyan-400' },
                ].map(item => (
                  <div key={item.label}
                    className={`p-3 rounded-xl border ${dark ? 'bg-slate-900/50 border-slate-700/60' : 'bg-slate-50 border-slate-100'}`}>
                    <p className={`text-[11px] ${muted} mb-1`}>{item.label}</p>
                    <p className={`text-lg font-bold tabular-nums font-mono whitespace-nowrap ${item.color}`}>{item.val}</p>
                  </div>
                ))}
              </div>
              <p className={`text-[11px] leading-relaxed ${muted}`}>
                On a <span className="tabular-nums whitespace-nowrap">{fmt(raiseResult.grossRaise)}</span> raise, taxes consume <span className="tabular-nums whitespace-nowrap">{fmt(raiseResult.extraTax)}</span>.
                All-in marginal rate: <span className="text-amber-400 font-semibold tabular-nums whitespace-nowrap">{pct(raiseResult.extraTax / raiseResult.grossRaise)}</span>.
                Federal bracket: <span className="text-amber-400 font-semibold tabular-nums whitespace-nowrap">{pct(raiseResult.marginalFedRate)}</span>.
              </p>
            </div>
          )}

          {/* Next $1,000 */}
          {planningTab === 'marginal' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${dark ? 'bg-slate-900/50 border-slate-700/60' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-[11px] font-semibold uppercase mb-4 ${muted}`} style={{ letterSpacing: '0.07em', wordBreak: 'keep-all' }}>Tax on the next $1,000 of W-2 income</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: 'Goes to taxes', val: fmt(marginal1k.extraTax),   color: 'text-rose-400' },
                    { label: 'You keep',      val: fmt(marginal1k.keepAmount), color: 'text-emerald-400' },
                    { label: 'Keep rate',     val: pct(marginal1k.keepPct),    color: 'text-cyan-400' },
                  ].map(item => (
                    <div key={item.label}>
                      <p className={`text-xl font-bold tabular-nums font-mono whitespace-nowrap ${item.color}`}>{item.val}</p>
                      <p className={`text-[11px] mt-1 ${muted}`}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`space-y-2 text-xs border rounded-xl p-3 ${dark ? 'border-slate-700/60 bg-slate-900/30' : 'border-slate-100 bg-slate-50'}`}>
                {[
                  ['Federal marginal rate', pct(marginal1k.marginalFedRate), 'text-amber-400'],
                  ['State rate (approx)',   pct(result.stateTax.rate),        'text-violet-400'],
                  ['FICA on W-2',          w2Income < 168600 ? '7.65%' : w2Income < 200000 ? '1.45%' : '2.35%', 'text-orange-400'],
                ].map(([label, val, cls]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className={muted}>{label}</span>
                    <span className={`tabular-nums font-semibold ${cls}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What-If Scenario */}
          {planningTab === 'whatif' && (
            <div className="space-y-4">
              <DollarInput label="Scenario: Alternative W-2 Income" value={scenario2} onChange={setScenario2} dark={dark} />
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className={`text-[11px] border-b ${muted} ${divider}`}>
                      <th className="text-left py-2 font-medium">Metric</th>
                      <th className="text-right py-2 font-medium text-emerald-400">Current</th>
                      <th className="text-right py-2 font-medium text-cyan-400">Scenario</th>
                      <th className="text-right py-2 font-medium text-slate-400">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Federal Tax',  cur: result.totalFedTax,       alt: scenario2Result.totalFedTax    },
                      { label: 'FICA',         cur: result.fica.totalFICA,    alt: scenario2Result.fica.totalFICA },
                      { label: 'State Tax',    cur: result.stateTax.tax,      alt: scenario2Result.stateTax.tax   },
                      { label: 'Total Tax',    cur: result.totalTax,          alt: scenario2Result.totalTax       },
                      { label: 'Take-Home',    cur: result.takeHome,          alt: scenario2Result.takeHome       },
                    ].map(row => {
                      const diff = row.alt - row.cur;
                      return (
                        <tr key={row.label} className={`border-b text-xs ${divider}`}>
                          <td className={`py-2.5 ${muted}`}>{row.label}</td>
                          <td className="text-right py-2.5 tabular-nums text-emerald-400">{fmt(row.cur)}</td>
                          <td className="text-right py-2.5 tabular-nums text-cyan-400">{fmt(row.alt)}</td>
                          <td className={`text-right py-2.5 tabular-nums font-semibold ${diff > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {diff >= 0 ? '+' : ''}{fmt(Math.abs(diff))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2024 vs 2025 */}
          {planningTab === 'yearcomp' && (
            <div className="space-y-4">
              <YearCompareChart filingStatus={filingStatus} currentIncome={grossIncome || 100000} dark={dark} />
              <div className={`flex flex-wrap gap-x-5 gap-y-1 text-[11px] ${muted}`}>
                <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 bg-emerald-400 rounded" />2025 effective</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 border-t-2 border-dashed border-amber-400" />2024 effective</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-0.5 h-3 bg-red-400" />Your income</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[360px]">
                  <thead>
                    <tr className={`text-[11px] border-b ${muted} ${divider}`}>
                      {['Metric','2025','2024','Change'].map(h => (
                        <th key={h} className={`py-2 font-medium ${h === 'Metric' ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const r25 = calcAll({ ...inputs, year: 2025 });
                      const r24 = calcAll({ ...inputs, year: 2024 });
                      return [
                        { label: 'Std Deduction',  v25: r25.stdDed,          v24: r24.stdDed          },
                        { label: 'Federal Tax',     v25: r25.totalFedTax,     v24: r24.totalFedTax     },
                        { label: 'Taxable Income',  v25: r25.ordinaryTaxable, v24: r24.ordinaryTaxable },
                        { label: 'Take-Home',       v25: r25.takeHome,        v24: r24.takeHome        },
                      ].map(row => {
                        const diff = row.v25 - row.v24;
                        return (
                          <tr key={row.label} className={`border-b text-xs ${divider}`}>
                            <td className={`py-2.5 ${muted}`}>{row.label}</td>
                            <td className="text-right py-2.5 tabular-nums text-emerald-400">{fmt(row.v25)}</td>
                            <td className="text-right py-2.5 tabular-nums text-amber-400">{fmt(row.v24)}</td>
                            <td className={`text-right py-2.5 tabular-nums font-semibold ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {diff >= 0 ? '+' : ''}{fmt(Math.abs(diff))}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>

        {/* ── Federal Bracket Detail Table ─────────────────────────────── */}
        <Card dark={dark}>
          <div className="flex items-center justify-between mb-3 gap-3">
            <SLabel dark={dark} className="mb-0">Federal Tax Breakdown</SLabel>
            <button onClick={handleCopyBreakdown}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${dark
                ? 'border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-indigo-300'
                : 'border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'}`}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[440px]">
              <thead>
                <tr className={`border-b ${muted} ${divider}`}>
                  {['Rate','Range','In Bracket','Tax Owed','Share'].map(h => (
                    <th key={h} className={`py-2 font-medium ${h === 'Rate' || h === 'Range' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.fedOrdinary.breakdown.filter(b => b.inBracket > 0).map((b, i) => (
                  <tr key={i} className={`border-b ${divider}`}>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[11px] font-bold text-white tabular-nums"
                        style={{ background: BRACKET_COLORS[i] }}>
                        {(b.rate * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className={`py-2.5 tabular-nums ${muted}`}>
                      {fmt(b.lower)} – {b.upper === Infinity ? '∞' : fmt(b.upper)}
                    </td>
                    <td className="text-right py-2.5 tabular-nums">{fmt(b.inBracket)}</td>
                    <td className="text-right py-2.5 tabular-nums text-rose-400 font-semibold">{fmt(b.tax)}</td>
                    <td className="text-right py-2.5">
                      <div className="flex items-center justify-end gap-2">
                        <div className={`h-1.5 w-14 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <div className="h-full rounded-full"
                            style={{ width: `${result.totalFedTax > 0 ? (b.tax / result.totalFedTax) * 100 : 0}%`, background: BRACKET_COLORS[i] }} />
                        </div>
                        <span className={`tabular-nums w-9 text-right ${muted}`}>
                          {result.totalFedTax > 0 ? pct(b.tax / result.totalFedTax) : '—'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {result.preferential > 0 && (
                  <tr className={`border-b ${divider}`}>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[11px] font-bold text-white bg-emerald-600">LTCG</span>
                    </td>
                    <td className={`py-2.5 ${muted}`}>Preferential (0/15/20%)</td>
                    <td className="text-right py-2.5 tabular-nums">{fmt(result.preferential)}</td>
                    <td className="text-right py-2.5 tabular-nums text-rose-400 font-semibold">{fmt(result.ltcgTax.totalTax)}</td>
                    <td className="text-right py-2.5 tabular-nums text-emerald-400">
                      {result.preferential > 0 ? pct(result.ltcgTax.totalTax / result.preferential) : '—'} eff.
                    </td>
                  </tr>
                )}
                <tr className={`font-semibold text-xs ${dark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                  <td colSpan={2} className="py-3 rounded-l-lg pl-2">Total Federal</td>
                  <td className="text-right py-3 tabular-nums">{fmt(result.ordinaryTaxable + result.preferential)}</td>
                  <td className="text-right py-3 tabular-nums text-rose-400">{fmt(result.totalFedTax)}</td>
                  <td className="text-right py-3 tabular-nums text-cyan-400 rounded-r-lg pr-2">{pct(result.effectiveRate)} eff.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── Action Bar ───────────────────────────────────────────────── */}
        <div className={`rounded-2xl border p-4 ${cardBase(dark)}`}>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleShare}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${dark
                ? 'border-indigo-600 text-indigo-300 hover:bg-indigo-900/40' : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50'}`}>
              {shareCopied ? 'Link Copied!' : 'Share URL'}
            </button>
            <button onClick={handleCopyBreakdown}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${dark
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              {copied ? 'Copied!' : 'Copy Breakdown'}
            </button>
            <button onClick={handlePDF}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all whitespace-nowrap">
              Export PDF
            </button>
          </div>
        </div>

        {/* ── Footer disclaimer ────────────────────────────────────────── */}
        <div className={`rounded-xl border p-4 text-[11px] leading-relaxed ${dark ? 'bg-slate-800/40 border-slate-700/60 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
          <p className={`font-semibold mb-1.5 text-xs ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Disclaimer &amp; Assumptions</p>
          <p>Based on 2025 IRS federal tax brackets (Rev. Proc. 2024-40) and FICA rates. Includes federal income tax, Social Security (6.2% up to $176,100 wage base), Medicare (1.45% + 0.9% above $200,000), and self-employment tax where applicable. State tax rates are simplified estimates from 2025 schedules. LTCG rates apply qualified dividends and long-term capital gains stacked on top of ordinary income per IRS rules. Standard deduction for 2025: $15,000 single / $30,000 married. Pre-tax deductions (401k, HSA, IRA) reduce AGI. This tool provides estimates only and is <strong>not financial, tax, or legal advice</strong>. Consult a qualified tax professional for your specific situation.</p>
        </div>
      </div>
      )}
      {mode === 'global' && <GlobalIncomeTax dark={dark} />}
      {mode === 'vat'    && <TouristVATRefund dark={dark} />}
      </div> {/* end pb-20 wrapper */}

      <BottomNav mode={mode} setMode={setMode} dark={dark} />
    </div>
  );
}
