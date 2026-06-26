// ── Federal Tax Brackets (IRS Rev. Proc.) ─────────────────────────────────
export const FEDERAL_BRACKETS = {
  2025: {
    // Rev. Proc. 2024-40
    single: [
      { rate: 0.10, max: 11925  },
      { rate: 0.12, max: 48475  },
      { rate: 0.22, max: 103350 },
      { rate: 0.24, max: 197300 },
      { rate: 0.32, max: 250525 },
      { rate: 0.35, max: 626350 },
      { rate: 0.37, max: Infinity },
    ],
    mfj: [
      { rate: 0.10, max: 23850  },
      { rate: 0.12, max: 96950  },
      { rate: 0.22, max: 206700 },
      { rate: 0.24, max: 394600 },
      { rate: 0.32, max: 501050 },
      { rate: 0.35, max: 751600 },
      { rate: 0.37, max: Infinity },
    ],
    hoh: [
      { rate: 0.10, max: 17000  },
      { rate: 0.12, max: 64850  },
      { rate: 0.22, max: 103350 },
      { rate: 0.24, max: 197300 },
      { rate: 0.32, max: 250500 },
      { rate: 0.35, max: 626350 },
      { rate: 0.37, max: Infinity },
    ],
  },
  2024: {
    // Rev. Proc. 2023-34
    single: [
      { rate: 0.10, max: 11600  },
      { rate: 0.12, max: 47150  },
      { rate: 0.22, max: 100525 },
      { rate: 0.24, max: 191950 },
      { rate: 0.32, max: 243725 },
      { rate: 0.35, max: 609350 },
      { rate: 0.37, max: Infinity },
    ],
    mfj: [
      { rate: 0.10, max: 23200  },
      { rate: 0.12, max: 94300  },
      { rate: 0.22, max: 201050 },
      { rate: 0.24, max: 383900 },
      { rate: 0.32, max: 487450 },
      { rate: 0.35, max: 731200 },
      { rate: 0.37, max: Infinity },
    ],
    hoh: [
      { rate: 0.10, max: 16550  },
      { rate: 0.12, max: 63100  },
      { rate: 0.22, max: 100500 },
      { rate: 0.24, max: 191950 },
      { rate: 0.32, max: 243700 },
      { rate: 0.35, max: 609350 },
      { rate: 0.37, max: Infinity },
    ],
  },
  2023: {
    // Rev. Proc. 2022-38
    single: [
      { rate: 0.10, max: 11000  },
      { rate: 0.12, max: 44725  },
      { rate: 0.22, max: 95375  },
      { rate: 0.24, max: 182950 },
      { rate: 0.32, max: 231250 },
      { rate: 0.35, max: 578125 },
      { rate: 0.37, max: Infinity },
    ],
    mfj: [
      { rate: 0.10, max: 22000  },
      { rate: 0.12, max: 89450  },
      { rate: 0.22, max: 190750 },
      { rate: 0.24, max: 364200 },
      { rate: 0.32, max: 462500 },
      { rate: 0.35, max: 693750 },
      { rate: 0.37, max: Infinity },
    ],
    hoh: [
      { rate: 0.10, max: 15700  },
      { rate: 0.12, max: 59850  },
      { rate: 0.22, max: 95350  },
      { rate: 0.24, max: 182950 },
      { rate: 0.32, max: 231250 },
      { rate: 0.35, max: 578100 },
      { rate: 0.37, max: Infinity },
    ],
  },
};

// ── Standard Deductions ────────────────────────────────────────────────────
export const STD_DEDUCTIONS = {
  2025: { single: 15000, mfj: 30000, hoh: 22500 },
  2024: { single: 14600, mfj: 29200, hoh: 21900 },
  2023: { single: 13850, mfj: 27700, hoh: 20800 },
};

// ── LTCG / Qualified Dividend Thresholds (year-indexed) ───────────────────
const LTCG_BY_YEAR = {
  2025: {
    single: [{ rate: 0.00, max: 48350  }, { rate: 0.15, max: 533400 }, { rate: 0.20, max: Infinity }],
    mfj:   [{ rate: 0.00, max: 96700   }, { rate: 0.15, max: 600050 }, { rate: 0.20, max: Infinity }],
    hoh:   [{ rate: 0.00, max: 64750   }, { rate: 0.15, max: 566700 }, { rate: 0.20, max: Infinity }],
  },
  2024: {
    single: [{ rate: 0.00, max: 47025  }, { rate: 0.15, max: 518900 }, { rate: 0.20, max: Infinity }],
    mfj:   [{ rate: 0.00, max: 94050   }, { rate: 0.15, max: 583750 }, { rate: 0.20, max: Infinity }],
    hoh:   [{ rate: 0.00, max: 63000   }, { rate: 0.15, max: 551350 }, { rate: 0.20, max: Infinity }],
  },
  2023: {
    single: [{ rate: 0.00, max: 44625  }, { rate: 0.15, max: 492300 }, { rate: 0.20, max: Infinity }],
    mfj:   [{ rate: 0.00, max: 89250   }, { rate: 0.15, max: 553850 }, { rate: 0.20, max: Infinity }],
    hoh:   [{ rate: 0.00, max: 59750   }, { rate: 0.15, max: 523050 }, { rate: 0.20, max: Infinity }],
  },
};

// Keep flat export for backward compat — points to current year
export const LTCG_THRESHOLDS = LTCG_BY_YEAR[2025];

// ── FICA Constants (year-indexed) ─────────────────────────────────────────
const FICA_BY_YEAR = {
  2025: { SS_RATE: 0.062, SS_WAGE_BASE: 176100, MEDICARE_RATE: 0.0145, ADD_MEDICARE_RATE: 0.009, ADD_MEDICARE_THRESHOLD: { single: 200000, mfj: 250000, hoh: 200000 } },
  2024: { SS_RATE: 0.062, SS_WAGE_BASE: 168600, MEDICARE_RATE: 0.0145, ADD_MEDICARE_RATE: 0.009, ADD_MEDICARE_THRESHOLD: { single: 200000, mfj: 250000, hoh: 200000 } },
  2023: { SS_RATE: 0.062, SS_WAGE_BASE: 160200, MEDICARE_RATE: 0.0145, ADD_MEDICARE_RATE: 0.009, ADD_MEDICARE_THRESHOLD: { single: 200000, mfj: 250000, hoh: 200000 } },
};

export const FICA = FICA_BY_YEAR[2025];

// ── Contribution Limits (year-indexed) ────────────────────────────────────
const LIMITS_BY_YEAR = {
  2025: { k401: 23500, hsa_self: 4300, hsa_family: 8550, ira: 7000 },
  2024: { k401: 23000, hsa_self: 4150, hsa_family: 8300, ira: 7000 },
  2023: { k401: 22500, hsa_self: 3850, hsa_family: 7750, ira: 6500 },
};

export const LIMITS = LIMITS_BY_YEAR[2025];

// ── Filing Status Labels ───────────────────────────────────────────────────
export const FILING_STATUSES = {
  single: { label: 'Single',                icon: '👤' },
  mfj:    { label: 'Married Filing Jointly', icon: '👫' },
  hoh:    { label: 'Head of Household',      icon: '🏠' },
};

// ── Bracket Colors (10% → 37%) ─────────────────────────────────────────────
export const BRACKET_COLORS = [
  '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444', '#a855f7', '#ec4899',
];

// ── State Tax Data (2025, simplified) ─────────────────────────────────────
export const STATE_TAXES = {
  NONE: { name: 'No State',           type: 'none' },
  AK:   { name: 'Alaska',             type: 'none' },
  FL:   { name: 'Florida',            type: 'none' },
  NV:   { name: 'Nevada',             type: 'none' },
  NH:   { name: 'New Hampshire',      type: 'none' },
  SD:   { name: 'South Dakota',       type: 'none' },
  TN:   { name: 'Tennessee',          type: 'none' },
  TX:   { name: 'Texas',              type: 'none' },
  WA:   { name: 'Washington',         type: 'none' },
  WY:   { name: 'Wyoming',            type: 'none' },
  AZ:   { name: 'Arizona',            type: 'flat', rate: 0.025   },
  CO:   { name: 'Colorado',           type: 'flat', rate: 0.044   },
  GA:   { name: 'Georgia',            type: 'flat', rate: 0.0549  },
  ID:   { name: 'Idaho',              type: 'flat', rate: 0.058   },
  IL:   { name: 'Illinois',           type: 'flat', rate: 0.0495  },
  IN:   { name: 'Indiana',            type: 'flat', rate: 0.0305  },
  KY:   { name: 'Kentucky',           type: 'flat', rate: 0.04    },
  MA:   { name: 'Massachusetts',      type: 'flat', rate: 0.05    },
  MI:   { name: 'Michigan',           type: 'flat', rate: 0.0425  },
  MS:   { name: 'Mississippi',        type: 'flat', rate: 0.047   },
  NC:   { name: 'North Carolina',     type: 'flat', rate: 0.045   },
  PA:   { name: 'Pennsylvania',       type: 'flat', rate: 0.0307  },
  UT:   { name: 'Utah',               type: 'flat', rate: 0.0465  },
  AL:   { name: 'Alabama',            type: 'brackets', brackets: [
    { rate: 0.02, max: 500 }, { rate: 0.04, max: 3000 }, { rate: 0.05, max: Infinity }
  ]},
  AR:   { name: 'Arkansas',           type: 'brackets', brackets: [
    { rate: 0.02, max: 4000 }, { rate: 0.04, max: 8000 }, { rate: 0.049, max: Infinity }
  ]},
  CA:   { name: 'California',         type: 'brackets', brackets: [
    { rate: 0.01,  max: 10099  }, { rate: 0.02,  max: 23942  },
    { rate: 0.04,  max: 37788  }, { rate: 0.06,  max: 52455  },
    { rate: 0.08,  max: 66295  }, { rate: 0.093, max: 338639 },
    { rate: 0.103, max: 406364 }, { rate: 0.113, max: 677275 },
    { rate: 0.123, max: 1000000}, { rate: 0.133, max: Infinity },
  ]},
  CT:   { name: 'Connecticut',        type: 'brackets', brackets: [
    { rate: 0.02, max: 10000 }, { rate: 0.045, max: 50000 },
    { rate: 0.055, max: 100000 }, { rate: 0.06, max: 200000 },
    { rate: 0.065, max: 250000 }, { rate: 0.069, max: 500000 },
    { rate: 0.0699, max: Infinity },
  ]},
  DC:   { name: 'District of Columbia', type: 'brackets', brackets: [
    { rate: 0.04, max: 10000 }, { rate: 0.06, max: 40000 },
    { rate: 0.065, max: 60000 }, { rate: 0.085, max: 250000 },
    { rate: 0.0925, max: 500000 }, { rate: 0.0975, max: 1000000 },
    { rate: 0.1075, max: Infinity },
  ]},
  DE:   { name: 'Delaware',           type: 'brackets', brackets: [
    { rate: 0, max: 2000 }, { rate: 0.022, max: 5000 },
    { rate: 0.039, max: 10000 }, { rate: 0.048, max: 20000 },
    { rate: 0.052, max: 25000 }, { rate: 0.0555, max: 60000 },
    { rate: 0.066, max: Infinity },
  ]},
  HI:   { name: 'Hawaii',             type: 'brackets', brackets: [
    { rate: 0.014, max: 2400  }, { rate: 0.032, max: 4800  },
    { rate: 0.055, max: 9600  }, { rate: 0.064, max: 14400 },
    { rate: 0.068, max: 19200 }, { rate: 0.072, max: 24000 },
    { rate: 0.076, max: 36000 }, { rate: 0.079, max: 48000 },
    { rate: 0.0825, max: 150000 }, { rate: 0.09, max: 175000 },
    { rate: 0.10, max: 200000 }, { rate: 0.11, max: Infinity },
  ]},
  IA:   { name: 'Iowa',               type: 'brackets', brackets: [
    { rate: 0.044, max: 6000 }, { rate: 0.0482, max: 30000 }, { rate: 0.057, max: Infinity }
  ]},
  KS:   { name: 'Kansas',             type: 'brackets', brackets: [
    { rate: 0.031, max: 15000 }, { rate: 0.0525, max: 30000 }, { rate: 0.057, max: Infinity }
  ]},
  LA:   { name: 'Louisiana',          type: 'brackets', brackets: [
    { rate: 0.0185, max: 12500 }, { rate: 0.035, max: 50000 }, { rate: 0.0425, max: Infinity }
  ]},
  ME:   { name: 'Maine',              type: 'brackets', brackets: [
    { rate: 0.058, max: 24500 }, { rate: 0.0675, max: 58050 }, { rate: 0.0715, max: Infinity }
  ]},
  MD:   { name: 'Maryland',           type: 'brackets', brackets: [
    { rate: 0.02, max: 1000 }, { rate: 0.03, max: 2000 },
    { rate: 0.04, max: 3000 }, { rate: 0.0475, max: 100000 },
    { rate: 0.05, max: 125000 }, { rate: 0.0525, max: 150000 },
    { rate: 0.055, max: 250000 }, { rate: 0.0575, max: Infinity },
  ]},
  MN:   { name: 'Minnesota',          type: 'brackets', brackets: [
    { rate: 0.0535, max: 30070 }, { rate: 0.068, max: 98760 },
    { rate: 0.0785, max: 183340 }, { rate: 0.0985, max: Infinity },
  ]},
  MO:   { name: 'Missouri',           type: 'brackets', brackets: [
    { rate: 0, max: 1207 }, { rate: 0.02, max: 2414 },
    { rate: 0.025, max: 3621 }, { rate: 0.03, max: 4828 },
    { rate: 0.035, max: 6035 }, { rate: 0.04, max: 8449 },
    { rate: 0.048, max: Infinity },
  ]},
  MT:   { name: 'Montana',            type: 'brackets', brackets: [
    { rate: 0.047, max: 20500 }, { rate: 0.059, max: Infinity }
  ]},
  NE:   { name: 'Nebraska',           type: 'brackets', brackets: [
    { rate: 0.0246, max: 3700 }, { rate: 0.0351, max: 22170 },
    { rate: 0.0501, max: 35730 }, { rate: 0.0664, max: Infinity },
  ]},
  NJ:   { name: 'New Jersey',         type: 'brackets', brackets: [
    { rate: 0.014, max: 20000 }, { rate: 0.0175, max: 35000 },
    { rate: 0.035, max: 40000 }, { rate: 0.05525, max: 75000 },
    { rate: 0.0637, max: 500000 }, { rate: 0.0897, max: 1000000 },
    { rate: 0.1075, max: Infinity },
  ]},
  NM:   { name: 'New Mexico',         type: 'brackets', brackets: [
    { rate: 0.017, max: 5500 }, { rate: 0.032, max: 11000 },
    { rate: 0.047, max: 16000 }, { rate: 0.049, max: 210000 },
    { rate: 0.059, max: Infinity },
  ]},
  NY:   { name: 'New York',           type: 'brackets', brackets: [
    { rate: 0.04,   max: 8500   }, { rate: 0.045,  max: 11700  },
    { rate: 0.0525, max: 13900  }, { rate: 0.0585, max: 21400  },
    { rate: 0.0625, max: 80650  }, { rate: 0.0685, max: 215400 },
    { rate: 0.0965, max: 1077550}, { rate: 0.103,  max: 5000000},
    { rate: 0.109,  max: Infinity },
  ]},
  ND:   { name: 'North Dakota',       type: 'brackets', brackets: [
    { rate: 0, max: 44725 }, { rate: 0.0195, max: 225975 }, { rate: 0.025, max: Infinity }
  ]},
  OH:   { name: 'Ohio',               type: 'brackets', brackets: [
    { rate: 0, max: 26050 }, { rate: 0.02765, max: 46100 },
    { rate: 0.03226, max: 92150 }, { rate: 0.03688, max: 115300 },
    { rate: 0.0399, max: Infinity },
  ]},
  OK:   { name: 'Oklahoma',           type: 'brackets', brackets: [
    { rate: 0.0025, max: 1000 }, { rate: 0.0075, max: 2500 },
    { rate: 0.0175, max: 3750 }, { rate: 0.0275, max: 4900 },
    { rate: 0.0375, max: 7200 }, { rate: 0.0475, max: Infinity },
  ]},
  OR:   { name: 'Oregon',             type: 'brackets', brackets: [
    { rate: 0.0475, max: 10000 }, { rate: 0.0675, max: 25000 },
    { rate: 0.0875, max: 125000 }, { rate: 0.099, max: Infinity },
  ]},
  RI:   { name: 'Rhode Island',       type: 'brackets', brackets: [
    { rate: 0.0375, max: 77450 }, { rate: 0.0475, max: 176050 }, { rate: 0.0599, max: Infinity }
  ]},
  SC:   { name: 'South Carolina',     type: 'brackets', brackets: [
    { rate: 0, max: 3460 }, { rate: 0.03, max: 17330 }, { rate: 0.064, max: Infinity }
  ]},
  VT:   { name: 'Vermont',            type: 'brackets', brackets: [
    { rate: 0.0335, max: 45400 }, { rate: 0.066, max: 110050 },
    { rate: 0.076, max: 229550 }, { rate: 0.0875, max: Infinity },
  ]},
  VA:   { name: 'Virginia',           type: 'brackets', brackets: [
    { rate: 0.02, max: 3000 }, { rate: 0.03, max: 5000 },
    { rate: 0.05, max: 17000 }, { rate: 0.0575, max: Infinity },
  ]},
  WV:   { name: 'West Virginia',      type: 'brackets', brackets: [
    { rate: 0.0236, max: 10000 }, { rate: 0.0315, max: 25000 },
    { rate: 0.0354, max: 40000 }, { rate: 0.0472, max: 60000 },
    { rate: 0.0512, max: Infinity },
  ]},
  WI:   { name: 'Wisconsin',          type: 'brackets', brackets: [
    { rate: 0.035, max: 14320 }, { rate: 0.044, max: 28640 },
    { rate: 0.053, max: 315310 }, { rate: 0.0765, max: Infinity },
  ]},
};

// ── Core Calculation Functions ─────────────────────────────────────────────

function applyBrackets(income, brackets) {
  let totalTax = 0;
  let marginalRate = 0;
  const breakdown = brackets.map((b, i) => {
    const lower = i === 0 ? 0 : brackets[i - 1].max;
    const upper = b.max === Infinity ? income : Math.min(income, b.max);
    const inBracket = Math.max(0, upper - lower);
    if (income > lower) marginalRate = b.rate;
    const tax = inBracket * b.rate;
    totalTax += tax;
    return { rate: b.rate, lower, upper: b.max, inBracket, tax };
  });
  return { totalTax, marginalRate, breakdown };
}

export function calcFederalOrdinary(taxableIncome, filingStatus, year = 2025) {
  const brackets = (FEDERAL_BRACKETS[year] || FEDERAL_BRACKETS[2025])[filingStatus];
  return applyBrackets(taxableIncome, brackets);
}

export function calcLTCGTax(ltcgAmount, ordinaryTaxableIncome, filingStatus, year = 2025) {
  if (ltcgAmount <= 0) return { totalTax: 0, breakdown: [] };
  const thresholds = (LTCG_BY_YEAR[year] || LTCG_BY_YEAR[2025])[filingStatus];
  let totalTax = 0;
  let remaining = ltcgAmount;
  let stacked = ordinaryTaxableIncome;
  const breakdown = thresholds.map(t => {
    const upper = t.max === Infinity ? stacked + remaining : t.max;
    const room = Math.max(0, upper - stacked);
    const inBracket = Math.min(remaining, room);
    const tax = inBracket * t.rate;
    totalTax += tax;
    remaining -= inBracket;
    stacked = Math.min(stacked + inBracket, upper);
    return { rate: t.rate, inBracket, tax };
  });
  return { totalTax, breakdown };
}

export function calcFICA(w2Income, seIncome = 0, filingStatus = 'single', year = 2025) {
  const { SS_RATE, SS_WAGE_BASE, MEDICARE_RATE, ADD_MEDICARE_RATE, ADD_MEDICARE_THRESHOLD } =
    FICA_BY_YEAR[year] || FICA_BY_YEAR[2025];
  const w2SS       = Math.min(w2Income, SS_WAGE_BASE) * SS_RATE;
  const w2Medicare = w2Income * MEDICARE_RATE;
  const seNet      = seIncome * 0.9235;
  const seSSBase   = Math.max(0, SS_WAGE_BASE - w2Income);
  const seSS       = Math.min(seNet, seSSBase) * 0.124;
  const seMedicare = seNet * 0.029;
  const seDeduction = (seSS + seMedicare) / 2;
  const combined   = w2Income + seNet;
  const threshold  = ADD_MEDICARE_THRESHOLD[filingStatus] || 200000;
  const addMedicare = Math.max(0, combined - threshold) * ADD_MEDICARE_RATE;
  return {
    w2SS, w2Medicare, seSS, seMedicare, addMedicare,
    seDeduction,
    totalFICA: w2SS + w2Medicare + seSS + seMedicare + addMedicare,
  };
}

export function calcStateTax(income, stateCode) {
  const st = STATE_TAXES[stateCode];
  if (!st || st.type === 'none') return { tax: 0, rate: 0, stateName: st?.name ?? 'None' };
  if (st.type === 'flat') return { tax: income * st.rate, rate: st.rate, stateName: st.name };
  const result = applyBrackets(income, st.brackets);
  return { tax: result.totalTax, rate: income > 0 ? result.totalTax / income : 0, stateName: st.name };
}

export function calcAll({
  w2Income = 0, ltcgIncome = 0, qualifiedDivs = 0, seIncome = 0,
  k401 = 0, hsa = 0, ira = 0,
  useStdDeduction = true, itemizedDeduction = 0,
  filingStatus = 'single', stateCode = 'NONE', year = 2025,
} = {}) {
  const grossIncome = w2Income + ltcgIncome + qualifiedDivs + seIncome;

  const fica = calcFICA(w2Income, seIncome, filingStatus, year);

  const preTax = Math.min(k401 + hsa + ira + fica.seDeduction, Math.max(0, w2Income + seIncome));
  const agi = Math.max(0, grossIncome - preTax);

  const stdDed = (STD_DEDUCTIONS[year] || STD_DEDUCTIONS[2025])[filingStatus];
  const deduction = useStdDeduction ? stdDed : Math.max(stdDed, itemizedDeduction);

  const ordinaryBeforeStd = Math.max(0, w2Income + seIncome - preTax);
  const ordinaryTaxable = Math.max(0, ordinaryBeforeStd - deduction);
  const preferential = ltcgIncome + qualifiedDivs;

  const fedOrdinary = calcFederalOrdinary(ordinaryTaxable, filingStatus, year);
  const ltcgTax = calcLTCGTax(preferential, ordinaryTaxable, filingStatus, year);

  const stateTaxBase = Math.max(0, agi - deduction);
  const stateTax = calcStateTax(stateTaxBase, stateCode);

  const totalFedTax = fedOrdinary.totalTax + ltcgTax.totalTax;
  const totalTax    = totalFedTax + stateTax.tax + fica.totalFICA;
  const takeHome    = Math.max(0, grossIncome - totalTax - preTax + fica.seDeduction);

  return {
    grossIncome, agi, deduction, stdDed, preTax,
    ordinaryTaxable, preferential,
    fedOrdinary, ltcgTax, stateTax, fica,
    totalFedTax, totalTax, takeHome,
    effectiveRate: grossIncome > 0 ? totalFedTax / grossIncome : 0,
    marginalRate: fedOrdinary.marginalRate,
  };
}

export function generateRateCurve(filingStatus, maxIncome, stateCode = 'NONE', year = 2025, steps = 80) {
  const results = [];
  for (let i = 0; i <= steps; i++) {
    const income = Math.round((i / steps) * maxIncome);
    if (income === 0) { results.push({ income, marginal: 0, effective: 0, combined: 0 }); continue; }
    const std = (STD_DEDUCTIONS[year] || STD_DEDUCTIONS[2025])[filingStatus];
    const taxable = Math.max(0, income - std);
    const fed = calcFederalOrdinary(taxable, filingStatus, year);
    const state = calcStateTax(taxable, stateCode);
    const fica = calcFICA(income, 0, filingStatus, year);
    const effectiveFed = fed.totalTax / income;
    const effectiveAll = (fed.totalTax + state.tax + fica.totalFICA) / income;
    results.push({
      income,
      marginal: Math.round(fed.marginalRate * 1000) / 10,
      effective: Math.round(effectiveFed * 1000) / 10,
      combined: Math.round(effectiveAll * 1000) / 10,
    });
  }
  return results;
}

export function calcRaise(baseInputs, raiseAmount) {
  const base   = calcAll(baseInputs);
  const raised = calcAll({ ...baseInputs, w2Income: (baseInputs.w2Income || 0) + raiseAmount });
  const extraTax   = raised.totalTax - base.totalTax;
  const keepAmount = raiseAmount - extraTax;
  return {
    grossRaise: raiseAmount, extraTax,
    keepAmount, keepPct: keepAmount / raiseAmount,
    newTotal: raised.takeHome,
    marginalFedRate: raised.marginalRate,
  };
}

export function calcMarginalDollar(baseInputs, amount = 1000) {
  const base = calcAll(baseInputs);
  const more = calcAll({ ...baseInputs, w2Income: (baseInputs.w2Income || 0) + amount });
  const extraTax = more.totalTax - base.totalTax;
  return {
    extraTax, keepAmount: amount - extraTax,
    keepPct: (amount - extraTax) / amount,
    marginalFedRate: more.marginalRate,
  };
}
