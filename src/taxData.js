export const BRACKET_COLORS = [
  '#4ade80','#60a5fa','#f59e0b','#f87171','#c084fc',
  '#fb923c','#e879f9','#34d399','#f472b6','#38bdf8','#a3e635','#fbbf24',
];

export const REGIONS = {
  Americas:    ['us','ca','mx','br','ar','co','cl','pe','ec','uy'],
  Europe:      ['gb','fr','de','es','it','nl','ch','se','no','dk','fi','be','at','pt','ie','gr','pl','cz','ro','hu','sk','hr','rs','ru','ua','lu','is'],
  'Asia Pacific': ['in','jp','cn','kr','sg','hk','th','id','my','ph','vn','tw','pk','bd','lk','nz','au'],
  'Middle East': ['ae','sa','qa','kw','bh','il','tr','eg','jo','ma'],
  Africa:      ['za','ng','ke','gh','et','tz','ug'],
};

export const COUNTRIES = {
  /* ── Americas ─────────────────────────────────────── */
  us: {
    name:'United States', flag:'🇺🇸', currency:'USD', locale:'en-US', year:'2026',
    note:'Federal income tax only.',
    inputPlaceholder:'100,000',
    statuses:{
      single:{ label:'Single', icon:'👤' },
      mfj:  { label:'Married Filing Jointly', icon:'👫' },
      hoh:  { label:'Head of Household', icon:'🏠' },
    },
    brackets:{
      single:[
        {rate:0.10,min:0,      max:12400},
        {rate:0.12,min:12401,  max:50400},
        {rate:0.22,min:50401,  max:105700},
        {rate:0.24,min:105701, max:201775},
        {rate:0.32,min:201776, max:256225},
        {rate:0.35,min:256226, max:640600},
        {rate:0.37,min:640601, max:Infinity},
      ],
      mfj:[
        {rate:0.10,min:0,      max:24800},
        {rate:0.12,min:24801,  max:100800},
        {rate:0.22,min:100801, max:211400},
        {rate:0.24,min:211401, max:403550},
        {rate:0.32,min:403551, max:512450},
        {rate:0.35,min:512451, max:768700},
        {rate:0.37,min:768701, max:Infinity},
      ],
      hoh:[
        {rate:0.10,min:0,      max:17700},
        {rate:0.12,min:17701,  max:67450},
        {rate:0.22,min:67451,  max:105700},
        {rate:0.24,min:105701, max:201775},
        {rate:0.32,min:201776, max:256200},
        {rate:0.35,min:256201, max:640600},
        {rate:0.37,min:640601, max:Infinity},
      ],
    },
  },

  ca: {
    name:'Canada', flag:'🇨🇦', currency:'CAD', locale:'en-CA', year:'2024',
    note:'Federal tax only. Provincial taxes vary.',
    inputPlaceholder:'80,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.150,min:0,      max:55867},
      {rate:0.205,min:55868,  max:111733},
      {rate:0.260,min:111734, max:154906},
      {rate:0.290,min:154907, max:220000},
      {rate:0.330,min:220001, max:Infinity},
    ]},
  },

  mx: {
    name:'Mexico', flag:'🇲🇽', currency:'MXN', locale:'es-MX', year:'2024',
    note:'Federal ISR (income tax).',
    inputPlaceholder:'500,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.0192,min:0,         max:8952},
      {rate:0.0640,min:8953,      max:75984},
      {rate:0.1088,min:75985,     max:133536},
      {rate:0.160, min:133537,    max:155229},
      {rate:0.1792,min:155230,    max:185852},
      {rate:0.2136,min:185853,    max:374837},
      {rate:0.2352,min:374838,    max:590795},
      {rate:0.300, min:590796,    max:1127926},
      {rate:0.320, min:1127927,   max:1503902},
      {rate:0.340, min:1503903,   max:4511707},
      {rate:0.350, min:4511708,   max:Infinity},
    ]},
  },

  br: {
    name:'Brazil', flag:'🇧🇷', currency:'BRL', locale:'pt-BR', year:'2024',
    note:'Federal income tax (IRPF).',
    inputPlaceholder:'80.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.000,min:0,      max:28559},
      {rate:0.075,min:28560,  max:33919},
      {rate:0.150,min:33920,  max:45012},
      {rate:0.225,min:45013,  max:55976},
      {rate:0.275,min:55977,  max:Infinity},
    ]},
  },

  ar: {
    name:'Argentina', flag:'🇦🇷', currency:'ARS', locale:'es-AR', year:'2024',
    note:'Brackets adjust frequently due to inflation.',
    inputPlaceholder:'5.000.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.05,min:0,          max:419645},
      {rate:0.09,min:419646,     max:839292},
      {rate:0.12,min:839293,     max:1258937},
      {rate:0.15,min:1258938,    max:1678585},
      {rate:0.19,min:1678586,    max:2517876},
      {rate:0.23,min:2517877,    max:3357168},
      {rate:0.27,min:3357169,    max:5035750},
      {rate:0.31,min:5035751,    max:6714331},
      {rate:0.35,min:6714332,    max:Infinity},
    ]},
  },

  co: {
    name:'Colombia', flag:'🇨🇴', currency:'COP', locale:'es-CO', year:'2024',
    note:'National income tax.',
    inputPlaceholder:'80.000.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,           max:51300850},
      {rate:0.19,min:51300851,    max:80010500},
      {rate:0.28,min:80010501,    max:192966500},
      {rate:0.33,min:192966501,   max:408034050},
      {rate:0.35,min:408034051,   max:893123500},
      {rate:0.37,min:893123501,   max:Infinity},
    ]},
  },

  cl: {
    name:'Chile', flag:'🇨🇱', currency:'CLP', locale:'es-CL', year:'2024',
    note:'Annual income tax (Global Complementario).',
    inputPlaceholder:'20.000.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.000,min:0,          max:9454800},
      {rate:0.040,min:9454801,    max:21022800},
      {rate:0.080,min:21022801,   max:35038800},
      {rate:0.135,min:35038801,   max:49050600},
      {rate:0.230,min:49050601,   max:63066000},
      {rate:0.304,min:63066001,   max:84088200},
      {rate:0.350,min:84088201,   max:168174600},
      {rate:0.400,min:168174601,  max:Infinity},
    ]},
  },

  pe: {
    name:'Peru', flag:'🇵🇪', currency:'PEN', locale:'es-PE', year:'2024',
    note:'Annual income tax.',
    inputPlaceholder:'100,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.08,min:0,       max:25750},
      {rate:0.14,min:25751,   max:103000},
      {rate:0.17,min:103001,  max:180250},
      {rate:0.20,min:180251,  max:231750},
      {rate:0.30,min:231751,  max:Infinity},
    ]},
  },

  ec: {
    name:'Ecuador', flag:'🇪🇨', currency:'USD', locale:'es-EC', year:'2024',
    note:'Ecuador uses USD. Annual income tax.',
    inputPlaceholder:'30,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,       max:11722},
      {rate:0.05,min:11723,   max:14664},
      {rate:0.10,min:14665,   max:19986},
      {rate:0.12,min:19987,   max:25622},
      {rate:0.15,min:25623,   max:33308},
      {rate:0.20,min:33309,   max:44411},
      {rate:0.25,min:44412,   max:59209},
      {rate:0.30,min:59210,   max:79664},
      {rate:0.35,min:79665,   max:Infinity},
    ]},
  },

  uy: {
    name:'Uruguay', flag:'🇺🇾', currency:'UYU', locale:'es-UY', year:'2024',
    note:'Category II income tax (IRPF).',
    inputPlaceholder:'500,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,       max:40536},
      {rate:0.10,min:40537,   max:81072},
      {rate:0.15,min:81073,   max:162144},
      {rate:0.24,min:162145,  max:243216},
      {rate:0.25,min:243217,  max:324288},
      {rate:0.27,min:324289,  max:486432},
      {rate:0.31,min:486433,  max:648576},
      {rate:0.36,min:648577,  max:Infinity},
    ]},
  },

  /* ── Europe ───────────────────────────────────────── */
  gb: {
    name:'United Kingdom', flag:'🇬🇧', currency:'GBP', locale:'en-GB', year:'2024/25',
    note:'Includes Personal Allowance. England, Wales & N. Ireland rates.',
    inputPlaceholder:'50,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,       max:12570},
      {rate:0.20,min:12571,   max:50270},
      {rate:0.40,min:50271,   max:125140},
      {rate:0.45,min:125141,  max:Infinity},
    ]},
  },

  fr: {
    name:'France', flag:'🇫🇷', currency:'EUR', locale:'fr-FR', year:'2024',
    note:'Income tax for a single person. Social charges not included.',
    inputPlaceholder:'40 000',
    statuses:{ individual:{ label:'Individual (1 part)', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,       max:11294},
      {rate:0.11,min:11295,   max:28797},
      {rate:0.30,min:28798,   max:82341},
      {rate:0.41,min:82342,   max:177106},
      {rate:0.45,min:177107,  max:Infinity},
    ]},
  },

  de: {
    name:'Germany', flag:'🇩🇪', currency:'EUR', locale:'de-DE', year:'2024',
    note:'Simplified — Germany uses a continuous progressive formula. Solidarity surcharge not included.',
    inputPlaceholder:'60.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,       max:11604},
      {rate:0.14,min:11605,   max:17005},
      {rate:0.32,min:17006,   max:66760},
      {rate:0.42,min:66761,   max:277825},
      {rate:0.45,min:277826,  max:Infinity},
    ]},
  },

  es: {
    name:'Spain', flag:'🇪🇸', currency:'EUR', locale:'es-ES', year:'2024',
    note:'State + regional general income tax (IRPF).',
    inputPlaceholder:'40.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.19,min:0,       max:12450},
      {rate:0.24,min:12451,   max:20200},
      {rate:0.30,min:20201,   max:35200},
      {rate:0.37,min:35201,   max:60000},
      {rate:0.45,min:60001,   max:300000},
      {rate:0.47,min:300001,  max:Infinity},
    ]},
  },

  it: {
    name:'Italy', flag:'🇮🇹', currency:'EUR', locale:'it-IT', year:'2024',
    note:'IRPEF national income tax. Regional/municipal surcharges not included.',
    inputPlaceholder:'40.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.23,min:0,       max:28000},
      {rate:0.35,min:28001,   max:50000},
      {rate:0.43,min:50001,   max:Infinity},
    ]},
  },

  nl: {
    name:'Netherlands', flag:'🇳🇱', currency:'EUR', locale:'nl-NL', year:'2024',
    note:'Box 1 income. Includes 27.65% national insurance contributions.',
    inputPlaceholder:'60.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.3697,min:0,      max:75518},
      {rate:0.4950,min:75519,  max:Infinity},
    ]},
  },

  ch: {
    name:'Switzerland', flag:'🇨🇭', currency:'CHF', locale:'de-CH', year:'2024',
    note:'Approximate Zurich combined (federal + cantonal + municipal). Other cantons vary.',
    inputPlaceholder:"100'000",
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,       max:13600},
      {rate:0.08,min:13601,   max:31700},
      {rate:0.15,min:31701,   max:56400},
      {rate:0.22,min:56401,   max:136400},
      {rate:0.30,min:136401,  max:927600},
      {rate:0.32,min:927601,  max:Infinity},
    ]},
  },

  se: {
    name:'Sweden', flag:'🇸🇪', currency:'SEK', locale:'sv-SE', year:'2024',
    note:'Municipal avg (~32%) + national surcharge above SEK 598,500.',
    inputPlaceholder:'500 000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.32,min:0,       max:598500},
      {rate:0.52,min:598501,  max:Infinity},
    ]},
  },

  no: {
    name:'Norway', flag:'🇳🇴', currency:'NOK', locale:'nb-NO', year:'2024',
    note:'General income tax (22%) + bracket tax (trinnskatt). Combined rates shown.',
    inputPlaceholder:'700 000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.220,min:0,       max:208050},
      {rate:0.237,min:208051,  max:292850},
      {rate:0.260,min:292851,  max:670000},
      {rate:0.356,min:670001,  max:937900},
      {rate:0.386,min:937901,  max:Infinity},
    ]},
  },

  dk: {
    name:'Denmark', flag:'🇩🇰', currency:'DKK', locale:'da-DK', year:'2024',
    note:'Approximate combined (bottom tax + avg municipal ~25%). Top tax 15% above DKK 588,900.',
    inputPlaceholder:'500.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00, min:0,       max:50543},
      {rate:0.374,min:50544,   max:588900},
      {rate:0.524,min:588901,  max:Infinity},
    ]},
  },

  fi: {
    name:'Finland', flag:'🇫🇮', currency:'EUR', locale:'fi-FI', year:'2024',
    note:'State + avg municipal + church taxes combined.',
    inputPlaceholder:'50.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00, min:0,       max:19900},
      {rate:0.264,min:19901,   max:29900},
      {rate:0.300,min:29901,   max:49000},
      {rate:0.380,min:49001,   max:85800},
      {rate:0.440,min:85801,   max:Infinity},
    ]},
  },

  be: {
    name:'Belgium', flag:'🇧🇪', currency:'EUR', locale:'fr-BE', year:'2024',
    note:'Federal income tax. Communal surcharge (~7%) not included.',
    inputPlaceholder:'50.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.25,min:0,       max:15820},
      {rate:0.40,min:15821,   max:27920},
      {rate:0.45,min:27921,   max:48320},
      {rate:0.50,min:48321,   max:Infinity},
    ]},
  },

  at: {
    name:'Austria', flag:'🇦🇹', currency:'EUR', locale:'de-AT', year:'2024',
    note:'Federal income tax (Einkommensteuer).',
    inputPlaceholder:'50.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,        max:12816},
      {rate:0.20,min:12817,    max:20818},
      {rate:0.30,min:20819,    max:34513},
      {rate:0.41,min:34514,    max:66612},
      {rate:0.48,min:66613,    max:99266},
      {rate:0.50,min:99267,    max:1000000},
      {rate:0.55,min:1000001,  max:Infinity},
    ]},
  },

  pt: {
    name:'Portugal', flag:'🇵🇹', currency:'EUR', locale:'pt-PT', year:'2024',
    note:'IRS national income tax.',
    inputPlaceholder:'25.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.1325,min:0,      max:7703},
      {rate:0.180, min:7704,   max:11623},
      {rate:0.230, min:11624,  max:16472},
      {rate:0.260, min:16473,  max:21321},
      {rate:0.3275,min:21322,  max:27146},
      {rate:0.370, min:27147,  max:39791},
      {rate:0.435, min:39792,  max:51997},
      {rate:0.450, min:51998,  max:81199},
      {rate:0.480, min:81200,  max:Infinity},
    ]},
  },

  ie: {
    name:'Ireland', flag:'🇮🇪', currency:'EUR', locale:'en-IE', year:'2024',
    note:'Includes USC. Personal credit and standard cut-off point for a single person.',
    inputPlaceholder:'50,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.20,min:0,       max:42000},
      {rate:0.40,min:42001,   max:Infinity},
    ]},
  },

  gr: {
    name:'Greece', flag:'🇬🇷', currency:'EUR', locale:'el-GR', year:'2024',
    note:'Income tax on employment income.',
    inputPlaceholder:'25.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.09,min:0,       max:10000},
      {rate:0.22,min:10001,   max:20000},
      {rate:0.28,min:20001,   max:30000},
      {rate:0.36,min:30001,   max:40000},
      {rate:0.44,min:40001,   max:Infinity},
    ]},
  },

  pl: {
    name:'Poland', flag:'🇵🇱', currency:'PLN', locale:'pl-PL', year:'2024',
    note:'After PLN 30,000 tax-free amount. Health insurance (9%) not included.',
    inputPlaceholder:'80 000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,        max:30000},
      {rate:0.12,min:30001,    max:120000},
      {rate:0.32,min:120001,   max:Infinity},
    ]},
  },

  cz: {
    name:'Czech Republic', flag:'🇨🇿', currency:'CZK', locale:'cs-CZ', year:'2024',
    note:'Personal income tax.',
    inputPlaceholder:'800 000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.15,min:0,         max:1582812},
      {rate:0.23,min:1582813,   max:Infinity},
    ]},
  },

  ro: {
    name:'Romania', flag:'🇷🇴', currency:'RON', locale:'ro-RO', year:'2024',
    note:'Flat 10% income tax. Social contributions additional.',
    inputPlaceholder:'50.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.10,min:0, max:Infinity},
    ]},
  },

  hu: {
    name:'Hungary', flag:'🇭🇺', currency:'HUF', locale:'hu-HU', year:'2024',
    note:'Flat 15% personal income tax.',
    inputPlaceholder:'5 000 000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.15,min:0, max:Infinity},
    ]},
  },

  sk: {
    name:'Slovakia', flag:'🇸🇰', currency:'EUR', locale:'sk-SK', year:'2024',
    note:'After non-taxable base (€4,500/year approx).',
    inputPlaceholder:'25.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.19,min:0,       max:47538},
      {rate:0.25,min:47539,   max:Infinity},
    ]},
  },

  hr: {
    name:'Croatia', flag:'🇭🇷', currency:'EUR', locale:'hr-HR', year:'2024',
    note:'National income tax. Municipal surtax varies (Zagreb +10%).',
    inputPlaceholder:'25.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.20,min:0,       max:50400},
      {rate:0.30,min:50401,   max:Infinity},
    ]},
  },

  rs: {
    name:'Serbia', flag:'🇷🇸', currency:'RSD', locale:'sr-RS', year:'2024',
    note:'Flat 10% personal income tax on employment income.',
    inputPlaceholder:'2 000 000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.10,min:0, max:Infinity},
    ]},
  },

  ru: {
    name:'Russia', flag:'🇷🇺', currency:'RUB', locale:'ru-RU', year:'2024',
    note:'Personal income tax (НДФЛ).',
    inputPlaceholder:'1 000 000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.13,min:0,          max:5000000},
      {rate:0.15,min:5000001,    max:Infinity},
    ]},
  },

  ua: {
    name:'Ukraine', flag:'🇺🇦', currency:'UAH', locale:'uk-UA', year:'2024',
    note:'18% flat income tax + 5% military levy (wartime). Combined 23% shown.',
    inputPlaceholder:'200 000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.23,min:0, max:Infinity},
    ]},
  },

  lu: {
    name:'Luxembourg', flag:'🇱🇺', currency:'EUR', locale:'fr-LU', year:'2024',
    note:'National income tax. Class 1 (single).',
    inputPlaceholder:'60.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00, min:0,       max:11265},
      {rate:0.08, min:11266,   max:13173},
      {rate:0.09, min:13174,   max:15081},
      {rate:0.10, min:15082,   max:16989},
      {rate:0.11, min:16990,   max:18897},
      {rate:0.12, min:18898,   max:20805},
      {rate:0.14, min:20806,   max:22713},
      {rate:0.16, min:22714,   max:24621},
      {rate:0.18, min:24622,   max:26529},
      {rate:0.20, min:26530,   max:28437},
      {rate:0.22, min:28438,   max:30345},
      {rate:0.24, min:30346,   max:32253},
      {rate:0.26, min:32254,   max:34161},
      {rate:0.28, min:34162,   max:36069},
      {rate:0.30, min:36070,   max:37977},
      {rate:0.32, min:37978,   max:39885},
      {rate:0.34, min:39886,   max:41793},
      {rate:0.36, min:41794,   max:43701},
      {rate:0.38, min:43702,   max:45609},
      {rate:0.39, min:45610,   max:100000},
      {rate:0.40, min:100001,  max:150000},
      {rate:0.41, min:150001,  max:200000},
      {rate:0.42, min:200001,  max:Infinity},
    ]},
  },

  is: {
    name:'Iceland', flag:'🇮🇸', currency:'ISK', locale:'is-IS', year:'2024',
    note:'National + municipal income tax combined.',
    inputPlaceholder:'5 000 000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.3148,min:0,         max:4491167},
      {rate:0.3798,min:4491168,   max:12614232},
      {rate:0.4628,min:12614233,  max:Infinity},
    ]},
  },

  /* ── Asia Pacific ─────────────────────────────────── */
  in: {
    name:'India', flag:'🇮🇳', currency:'INR', locale:'en-IN', year:'2024/25',
    note:'New Tax Regime (Sec 115BAC). Surcharge & cess not included.',
    inputPlaceholder:'10,00,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,         max:300000},
      {rate:0.05,min:300001,    max:700000},
      {rate:0.10,min:700001,    max:1000000},
      {rate:0.15,min:1000001,   max:1200000},
      {rate:0.20,min:1200001,   max:1500000},
      {rate:0.30,min:1500001,   max:Infinity},
    ]},
  },

  au: {
    name:'Australia', flag:'🇦🇺', currency:'AUD', locale:'en-AU', year:'2024/25',
    note:'Resident individual. Tax-free threshold included. Medicare levy (2%) not included.',
    inputPlaceholder:'90,000',
    statuses:{ individual:{ label:'Resident Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.000,min:0,       max:18200},
      {rate:0.190,min:18201,   max:45000},
      {rate:0.325,min:45001,   max:120000},
      {rate:0.370,min:120001,  max:180000},
      {rate:0.450,min:180001,  max:Infinity},
    ]},
  },

  nz: {
    name:'New Zealand', flag:'🇳🇿', currency:'NZD', locale:'en-NZ', year:'2024',
    note:'Personal income tax (PAYE).',
    inputPlaceholder:'80,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.105,min:0,       max:14000},
      {rate:0.175,min:14001,   max:48000},
      {rate:0.300,min:48001,   max:70000},
      {rate:0.330,min:70001,   max:180000},
      {rate:0.390,min:180001,  max:Infinity},
    ]},
  },

  jp: {
    name:'Japan', flag:'🇯🇵', currency:'JPY', locale:'ja-JP', year:'2024',
    note:'National income tax only. Inhabitant tax (~10%) not included.',
    inputPlaceholder:'5,000,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.05,min:0,           max:1950000},
      {rate:0.10,min:1950001,     max:3300000},
      {rate:0.20,min:3300001,     max:6950000},
      {rate:0.23,min:6950001,     max:9000000},
      {rate:0.33,min:9000001,     max:18000000},
      {rate:0.40,min:18000001,    max:40000000},
      {rate:0.45,min:40000001,    max:Infinity},
    ]},
  },

  cn: {
    name:'China', flag:'🇨🇳', currency:'CNY', locale:'zh-CN', year:'2024',
    note:'Individual income tax (IIT) on comprehensive income.',
    inputPlaceholder:'200,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.03,min:0,        max:36000},
      {rate:0.10,min:36001,    max:144000},
      {rate:0.20,min:144001,   max:300000},
      {rate:0.25,min:300001,   max:420000},
      {rate:0.30,min:420001,   max:660000},
      {rate:0.35,min:660001,   max:960000},
      {rate:0.45,min:960001,   max:Infinity},
    ]},
  },

  kr: {
    name:'South Korea', flag:'🇰🇷', currency:'KRW', locale:'ko-KR', year:'2024',
    note:'National income tax. Local income tax (~10% surcharge) not included.',
    inputPlaceholder:'50,000,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.06,min:0,              max:14000000},
      {rate:0.15,min:14000001,       max:50000000},
      {rate:0.24,min:50000001,       max:88000000},
      {rate:0.35,min:88000001,       max:150000000},
      {rate:0.38,min:150000001,      max:300000000},
      {rate:0.40,min:300000001,      max:500000000},
      {rate:0.42,min:500000001,      max:1000000000},
      {rate:0.45,min:1000000001,     max:Infinity},
    ]},
  },

  sg: {
    name:'Singapore', flag:'🇸🇬', currency:'SGD', locale:'en-SG', year:'2024',
    note:'Resident individual income tax.',
    inputPlaceholder:'100,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.000,min:0,        max:20000},
      {rate:0.020,min:20001,    max:30000},
      {rate:0.035,min:30001,    max:40000},
      {rate:0.070,min:40001,    max:80000},
      {rate:0.115,min:80001,    max:120000},
      {rate:0.150,min:120001,   max:160000},
      {rate:0.180,min:160001,   max:200000},
      {rate:0.190,min:200001,   max:240000},
      {rate:0.195,min:240001,   max:280000},
      {rate:0.200,min:280001,   max:320000},
      {rate:0.220,min:320001,   max:Infinity},
    ]},
  },

  hk: {
    name:'Hong Kong', flag:'🇭🇰', currency:'HKD', locale:'zh-HK', year:'2024/25',
    note:'Salaries tax (progressive). Standard rate 15% cap applies if lower.',
    inputPlaceholder:'300,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.02,min:0,        max:50000},
      {rate:0.06,min:50001,    max:100000},
      {rate:0.10,min:100001,   max:150000},
      {rate:0.14,min:150001,   max:200000},
      {rate:0.17,min:200001,   max:Infinity},
    ]},
  },

  th: {
    name:'Thailand', flag:'🇹🇭', currency:'THB', locale:'th-TH', year:'2024',
    note:'Personal income tax.',
    inputPlaceholder:'1,000,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,           max:150000},
      {rate:0.05,min:150001,      max:300000},
      {rate:0.10,min:300001,      max:500000},
      {rate:0.15,min:500001,      max:750000},
      {rate:0.20,min:750001,      max:1000000},
      {rate:0.25,min:1000001,     max:2000000},
      {rate:0.30,min:2000001,     max:5000000},
      {rate:0.35,min:5000001,     max:Infinity},
    ]},
  },

  id: {
    name:'Indonesia', flag:'🇮🇩', currency:'IDR', locale:'id-ID', year:'2024',
    note:'Personal income tax (PPh Pasal 17).',
    inputPlaceholder:'300.000.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.05,min:0,              max:60000000},
      {rate:0.15,min:60000001,       max:250000000},
      {rate:0.25,min:250000001,      max:500000000},
      {rate:0.30,min:500000001,      max:5000000000},
      {rate:0.35,min:5000000001,     max:Infinity},
    ]},
  },

  my: {
    name:'Malaysia', flag:'🇲🇾', currency:'MYR', locale:'ms-MY', year:'2024',
    note:'Personal income tax (resident individual).',
    inputPlaceholder:'80,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,         max:5000},
      {rate:0.01,min:5001,      max:20000},
      {rate:0.03,min:20001,     max:35000},
      {rate:0.08,min:35001,     max:50000},
      {rate:0.13,min:50001,     max:70000},
      {rate:0.21,min:70001,     max:100000},
      {rate:0.24,min:100001,    max:400000},
      {rate:0.25,min:400001,    max:600000},
      {rate:0.26,min:600001,    max:2000000},
      {rate:0.28,min:2000001,   max:Infinity},
    ]},
  },

  ph: {
    name:'Philippines', flag:'🇵🇭', currency:'PHP', locale:'en-PH', year:'2024',
    note:'TRAIN Act personal income tax.',
    inputPlaceholder:'500,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,          max:250000},
      {rate:0.15,min:250001,     max:400000},
      {rate:0.20,min:400001,     max:800000},
      {rate:0.25,min:800001,     max:2000000},
      {rate:0.30,min:2000001,    max:8000000},
      {rate:0.35,min:8000001,    max:Infinity},
    ]},
  },

  vn: {
    name:'Vietnam', flag:'🇻🇳', currency:'VND', locale:'vi-VN', year:'2024',
    note:'Personal income tax (PIT) on employment income.',
    inputPlaceholder:'200.000.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.05,min:0,            max:60000000},
      {rate:0.10,min:60000001,     max:120000000},
      {rate:0.15,min:120000001,    max:216000000},
      {rate:0.20,min:216000001,    max:384000000},
      {rate:0.25,min:384000001,    max:624000000},
      {rate:0.30,min:624000001,    max:960000000},
      {rate:0.35,min:960000001,    max:Infinity},
    ]},
  },

  tw: {
    name:'Taiwan', flag:'🇹🇼', currency:'TWD', locale:'zh-TW', year:'2024',
    note:'Individual income tax.',
    inputPlaceholder:'1,000,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.05,min:0,           max:560000},
      {rate:0.12,min:560001,      max:1260000},
      {rate:0.20,min:1260001,     max:2520000},
      {rate:0.30,min:2520001,     max:4720000},
      {rate:0.40,min:4720001,     max:Infinity},
    ]},
  },

  pk: {
    name:'Pakistan', flag:'🇵🇰', currency:'PKR', locale:'en-PK', year:'2024',
    note:'Personal income tax (salaried individuals).',
    inputPlaceholder:'1,200,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,          max:600000},
      {rate:0.05,min:600001,     max:1200000},
      {rate:0.15,min:1200001,    max:2400000},
      {rate:0.25,min:2400001,    max:3600000},
      {rate:0.30,min:3600001,    max:6000000},
      {rate:0.35,min:6000001,    max:Infinity},
    ]},
  },

  bd: {
    name:'Bangladesh', flag:'🇧🇩', currency:'BDT', locale:'bn-BD', year:'2024',
    note:'Personal income tax.',
    inputPlaceholder:'700,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,         max:350000},
      {rate:0.05,min:350001,    max:450000},
      {rate:0.10,min:450001,    max:750000},
      {rate:0.15,min:750001,    max:1150000},
      {rate:0.20,min:1150001,   max:1650000},
      {rate:0.25,min:1650001,   max:Infinity},
    ]},
  },

  lk: {
    name:'Sri Lanka', flag:'🇱🇰', currency:'LKR', locale:'si-LK', year:'2024',
    note:'Personal income tax (APIT/PAYE).',
    inputPlaceholder:'2,000,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.06,min:0,           max:500000},
      {rate:0.12,min:500001,      max:1000000},
      {rate:0.18,min:1000001,     max:1500000},
      {rate:0.24,min:1500001,     max:2000000},
      {rate:0.30,min:2000001,     max:2500000},
      {rate:0.36,min:2500001,     max:Infinity},
    ]},
  },

  /* ── Middle East ──────────────────────────────────── */
  ae: {
    name:'United Arab Emirates', flag:'🇦🇪', currency:'AED', locale:'en-AE', year:'2024',
    note:'No personal income tax in the UAE.',
    inputPlaceholder:'300,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[{ rate:0, min:0, max:Infinity }]},
  },

  sa: {
    name:'Saudi Arabia', flag:'🇸🇦', currency:'SAR', locale:'ar-SA', year:'2024',
    note:'No personal income tax for individuals in Saudi Arabia.',
    inputPlaceholder:'200,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[{ rate:0, min:0, max:Infinity }]},
  },

  qa: {
    name:'Qatar', flag:'🇶🇦', currency:'QAR', locale:'ar-QA', year:'2024',
    note:'No personal income tax in Qatar.',
    inputPlaceholder:'200,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[{ rate:0, min:0, max:Infinity }]},
  },

  kw: {
    name:'Kuwait', flag:'🇰🇼', currency:'KWD', locale:'ar-KW', year:'2024',
    note:'No personal income tax in Kuwait.',
    inputPlaceholder:'20,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[{ rate:0, min:0, max:Infinity }]},
  },

  bh: {
    name:'Bahrain', flag:'🇧🇭', currency:'BHD', locale:'ar-BH', year:'2024',
    note:'No personal income tax in Bahrain.',
    inputPlaceholder:'15,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[{ rate:0, min:0, max:Infinity }]},
  },

  il: {
    name:'Israel', flag:'🇮🇱', currency:'ILS', locale:'he-IL', year:'2024',
    note:'National income tax. National insurance and health tax not included.',
    inputPlaceholder:'200,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.10,min:0,        max:77400},
      {rate:0.14,min:77401,    max:110880},
      {rate:0.20,min:110881,   max:178080},
      {rate:0.31,min:178081,   max:247440},
      {rate:0.35,min:247441,   max:514920},
      {rate:0.47,min:514921,   max:Infinity},
    ]},
  },

  tr: {
    name:'Turkey', flag:'🇹🇷', currency:'TRY', locale:'tr-TR', year:'2024',
    note:'Personal income tax (Gelir Vergisi).',
    inputPlaceholder:'500.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.15,min:0,          max:110000},
      {rate:0.20,min:110001,     max:230000},
      {rate:0.27,min:230001,     max:870000},
      {rate:0.35,min:870001,     max:3000000},
      {rate:0.40,min:3000001,    max:Infinity},
    ]},
  },

  eg: {
    name:'Egypt', flag:'🇪🇬', currency:'EGP', locale:'ar-EG', year:'2024',
    note:'Personal income tax.',
    inputPlaceholder:'200,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.000,min:0,        max:40000},
      {rate:0.100,min:40001,    max:55000},
      {rate:0.150,min:55001,    max:70000},
      {rate:0.200,min:70001,    max:200000},
      {rate:0.225,min:200001,   max:400000},
      {rate:0.250,min:400001,   max:1200000},
      {rate:0.275,min:1200001,  max:Infinity},
    ]},
  },

  jo: {
    name:'Jordan', flag:'🇯🇴', currency:'JOD', locale:'ar-JO', year:'2024',
    note:'Personal income tax after JOD 9,000 exemption.',
    inputPlaceholder:'30,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,       max:9000},
      {rate:0.05,min:9001,    max:14000},
      {rate:0.10,min:14001,   max:19000},
      {rate:0.15,min:19001,   max:24000},
      {rate:0.20,min:24001,   max:32000},
      {rate:0.25,min:32001,   max:Infinity},
    ]},
  },

  ma: {
    name:'Morocco', flag:'🇲🇦', currency:'MAD', locale:'fr-MA', year:'2024',
    note:'IGR personal income tax.',
    inputPlaceholder:'120.000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00, min:0,        max:40000},
      {rate:0.10, min:40001,    max:60000},
      {rate:0.20, min:60001,    max:80000},
      {rate:0.30, min:80001,    max:100000},
      {rate:0.34, min:100001,   max:180000},
      {rate:0.38, min:180001,   max:Infinity},
    ]},
  },

  /* ── Africa ───────────────────────────────────────── */
  za: {
    name:'South Africa', flag:'🇿🇦', currency:'ZAR', locale:'en-ZA', year:'2024/25',
    note:'Excludes primary rebate (R17,235). Effectively tax-free to ~R95,750.',
    inputPlaceholder:'500,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.18,min:0,          max:237100},
      {rate:0.26,min:237101,     max:370500},
      {rate:0.31,min:370501,     max:512800},
      {rate:0.36,min:512801,     max:673000},
      {rate:0.39,min:673001,     max:857900},
      {rate:0.41,min:857901,     max:1817000},
      {rate:0.45,min:1817001,    max:Infinity},
    ]},
  },

  ng: {
    name:'Nigeria', flag:'🇳🇬', currency:'NGN', locale:'en-NG', year:'2024',
    note:'Personal income tax (PITA).',
    inputPlaceholder:'5,000,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.07,min:0,          max:300000},
      {rate:0.11,min:300001,     max:600000},
      {rate:0.15,min:600001,     max:1100000},
      {rate:0.19,min:1100001,    max:1600000},
      {rate:0.21,min:1600001,    max:3200000},
      {rate:0.24,min:3200001,    max:Infinity},
    ]},
  },

  ke: {
    name:'Kenya', flag:'🇰🇪', currency:'KES', locale:'sw-KE', year:'2024',
    note:'PAYE income tax.',
    inputPlaceholder:'1,000,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.100,min:0,          max:288000},
      {rate:0.250,min:288001,     max:388000},
      {rate:0.300,min:388001,     max:6000000},
      {rate:0.325,min:6000001,    max:9600000},
      {rate:0.350,min:9600001,    max:Infinity},
    ]},
  },

  gh: {
    name:'Ghana', flag:'🇬🇭', currency:'GHS', locale:'en-GH', year:'2024',
    note:'Personal income tax.',
    inputPlaceholder:'50,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.000,min:0,        max:4380},
      {rate:0.050,min:4381,     max:5980},
      {rate:0.100,min:5981,     max:7980},
      {rate:0.175,min:7981,     max:49980},
      {rate:0.250,min:49981,    max:249983},
      {rate:0.300,min:249984,   max:Infinity},
    ]},
  },

  et: {
    name:'Ethiopia', flag:'🇪🇹', currency:'ETB', locale:'am-ET', year:'2024',
    note:'Employment income tax.',
    inputPlaceholder:'100,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,        max:1800},
      {rate:0.10,min:1801,     max:7800},
      {rate:0.15,min:7801,     max:16800},
      {rate:0.20,min:16801,    max:28200},
      {rate:0.25,min:28201,    max:42600},
      {rate:0.30,min:42601,    max:60000},
      {rate:0.35,min:60001,    max:Infinity},
    ]},
  },

  tz: {
    name:'Tanzania', flag:'🇹🇿', currency:'TZS', locale:'sw-TZ', year:'2024',
    note:'Personal income tax (PAYE).',
    inputPlaceholder:'5,000,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,           max:3240000},
      {rate:0.08,min:3240001,     max:6240000},
      {rate:0.20,min:6240001,     max:9240000},
      {rate:0.25,min:9240001,     max:Infinity},
    ]},
  },

  ug: {
    name:'Uganda', flag:'🇺🇬', currency:'UGX', locale:'en-UG', year:'2024',
    note:'Personal income tax (PAYE).',
    inputPlaceholder:'30,000,000',
    statuses:{ individual:{ label:'Individual', icon:'👤' } },
    brackets:{ individual:[
      {rate:0.00,min:0,           max:2820000},
      {rate:0.10,min:2820001,     max:4020000},
      {rate:0.20,min:4020001,     max:120000000},
      {rate:0.30,min:120000001,   max:Infinity},
    ]},
  },
};

export function calculateTax(income, countryCode, filingStatus) {
  const country  = COUNTRIES[countryCode];
  const brackets = country.brackets[filingStatus];
  let totalTax   = 0;
  let marginalRate = 0;

  const breakdown = brackets.map((bracket, i) => {
    const lowerBound      = i === 0 ? 0 : brackets[i - 1].max;
    const upperBound      = bracket.max === Infinity ? income : bracket.max;
    const incomeInBracket = Math.max(0, Math.min(income, upperBound) - lowerBound);

    if (income > lowerBound) marginalRate = bracket.rate;

    const taxOwed = incomeInBracket * bracket.rate;
    totalTax += taxOwed;

    return { rate: bracket.rate, min: bracket.min, max: bracket.max, incomeInBracket, taxOwed };
  });

  const effectiveRate = income > 0 ? totalTax / income : 0;
  return { totalTax, effectiveRate, marginalRate, breakdown };
}
