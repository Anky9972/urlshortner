// Country centroids for world map positioning (equirectangular projection)
const COUNTRY_CENTROIDS = {
    US: { lat: 37.09, lon: -95.71, name: 'United States', flag: '🇺🇸' },
    GB: { lat: 55.37, lon: -3.43, name: 'United Kingdom', flag: '🇬🇧' },
    DE: { lat: 51.16, lon: 10.45, name: 'Germany', flag: '🇩🇪' },
    FR: { lat: 46.22, lon: 2.21, name: 'France', flag: '🇫🇷' },
    IN: { lat: 20.59, lon: 78.96, name: 'India', flag: '🇮🇳' },
    CN: { lat: 35.86, lon: 104.19, name: 'China', flag: '🇨🇳' },
    JP: { lat: 36.20, lon: 138.25, name: 'Japan', flag: '🇯🇵' },
    BR: { lat: -14.23, lon: -51.92, name: 'Brazil', flag: '🇧🇷' },
    CA: { lat: 56.13, lon: -106.34, name: 'Canada', flag: '🇨🇦' },
    AU: { lat: -25.27, lon: 133.77, name: 'Australia', flag: '🇦🇺' },
    RU: { lat: 61.52, lon: 105.31, name: 'Russia', flag: '🇷🇺' },
    KR: { lat: 35.90, lon: 127.76, name: 'South Korea', flag: '🇰🇷' },
    MX: { lat: 23.63, lon: -102.55, name: 'Mexico', flag: '🇲🇽' },
    ID: { lat: -0.78, lon: 113.92, name: 'Indonesia', flag: '🇮🇩' },
    TR: { lat: 38.96, lon: 35.24, name: 'Turkey', flag: '🇹🇷' },
    SA: { lat: 23.88, lon: 45.07, name: 'Saudi Arabia', flag: '🇸🇦' },
    ZA: { lat: -30.55, lon: 22.93, name: 'South Africa', flag: '🇿🇦' },
    AR: { lat: -38.41, lon: -63.61, name: 'Argentina', flag: '🇦🇷' },
    IT: { lat: 41.87, lon: 12.56, name: 'Italy', flag: '🇮🇹' },
    ES: { lat: 40.46, lon: -3.74, name: 'Spain', flag: '🇪🇸' },
    NL: { lat: 52.13, lon: 5.29, name: 'Netherlands', flag: '🇳🇱' },
    SE: { lat: 60.12, lon: 18.64, name: 'Sweden', flag: '🇸🇪' },
    PL: { lat: 51.91, lon: 19.14, name: 'Poland', flag: '🇵🇱' },
    UA: { lat: 48.37, lon: 31.16, name: 'Ukraine', flag: '🇺🇦' },
    SG: { lat: 1.35, lon: 103.81, name: 'Singapore', flag: '🇸🇬' },
    PK: { lat: 30.37, lon: 69.34, name: 'Pakistan', flag: '🇵🇰' },
    NG: { lat: 9.08, lon: 8.67, name: 'Nigeria', flag: '🇳🇬' },
    EG: { lat: 26.82, lon: 30.80, name: 'Egypt', flag: '🇪🇬' },
    PH: { lat: 12.87, lon: 121.77, name: 'Philippines', flag: '🇵🇭' },
    MY: { lat: 4.21, lon: 101.97, name: 'Malaysia', flag: '🇲🇾' },
    BD: { lat: 23.68, lon: 90.35, name: 'Bangladesh', flag: '🇧🇩' },
    TH: { lat: 15.87, lon: 100.99, name: 'Thailand', flag: '🇹🇭' },
    VN: { lat: 14.06, lon: 108.27, name: 'Vietnam', flag: '🇻🇳' },
    IR: { lat: 32.42, lon: 53.68, name: 'Iran', flag: '🇮🇷' },
    IQ: { lat: 33.22, lon: 43.67, name: 'Iraq', flag: '🇮🇶' },
    AE: { lat: 23.42, lon: 53.84, name: 'United Arab Emirates', flag: '🇦🇪' },
    PT: { lat: 39.39, lon: -8.22, name: 'Portugal', flag: '🇵🇹' },
    BE: { lat: 50.50, lon: 4.46, name: 'Belgium', flag: '🇧🇪' },
    CH: { lat: 46.81, lon: 8.22, name: 'Switzerland', flag: '🇨🇭' },
    AT: { lat: 47.51, lon: 14.55, name: 'Austria', flag: '🇦🇹' },
    GR: { lat: 39.07, lon: 21.82, name: 'Greece', flag: '🇬🇷' },
    CZ: { lat: 49.81, lon: 15.47, name: 'Czech Republic', flag: '🇨🇿' },
    RO: { lat: 45.94, lon: 24.96, name: 'Romania', flag: '🇷🇴' },
    HU: { lat: 47.16, lon: 19.50, name: 'Hungary', flag: '🇭🇺' },
    DK: { lat: 56.26, lon: 9.50, name: 'Denmark', flag: '🇩🇰' },
    FI: { lat: 61.92, lon: 25.74, name: 'Finland', flag: '🇫🇮' },
    NO: { lat: 60.47, lon: 8.47, name: 'Norway', flag: '🇳🇴' },
    IL: { lat: 31.04, lon: 34.85, name: 'Israel', flag: '🇮🇱' },
    NZ: { lat: -40.90, lon: 174.88, name: 'New Zealand', flag: '🇳🇿' },
    CL: { lat: -35.67, lon: -71.54, name: 'Chile', flag: '🇨🇱' },
    CO: { lat: 4.57, lon: -74.29, name: 'Colombia', flag: '🇨🇴' },
    PE: { lat: -9.18, lon: -75.01, name: 'Peru', flag: '🇵🇪' },
};

// Build a reverse lookup: full country name (lowercased) → 2-letter code
const NAME_TO_CODE = Object.fromEntries(
    Object.entries(COUNTRY_CENTROIDS).map(([code, info]) => [info.name.toLowerCase(), code])
);

// Resolve whatever string we have to a 2-letter code, or null
function resolveCode(raw) {
    if (!raw) return null;
    const s = raw.trim();
    if (s.length === 2) return s.toUpperCase();
    return NAME_TO_CODE[s.toLowerCase()] || null;
}

function latLonToSvg(lat, lon, w, h) {
    const x = ((lon + 180) / 360) * w;
    const y = ((90 - lat) / 180) * h;
    return { x, y };
}

export default function ClickMap({ clicks = [] }) {
    const W = 700, H = 350;

    // Aggregate by resolved 2-letter country code
    const byCountry = {};
    for (const click of clicks) {
        const code = resolveCode(click.countryCode) || resolveCode(click.country);
        if (!code) continue;
        byCountry[code] = (byCountry[code] || 0) + 1;
    }

    const sorted = Object.entries(byCountry)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

    const maxClicks = sorted[0]?.[1] || 1;

    // Build dots for the SVG map
    const dots = [];
    for (const [code, count] of sorted) {
        const centroid = COUNTRY_CENTROIDS[code];
        if (!centroid) continue;
        const { x, y } = latLonToSvg(centroid.lat, centroid.lon, W, H);
        const r = 4 + (count / maxClicks) * 18;
        dots.push({ code, count, x, y, r, ...centroid });
    }

    if (clicks.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500">
                <p className="text-sm">No geographic data available yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* SVG World Map */}
            <div className="relative rounded-xl overflow-hidden border border-[hsl(230,10%,15%)] bg-[hsl(230,15%,7%)]">
                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    className="w-full"
                    style={{ aspectRatio: `${W}/${H}` }}
                >
                    {/* Graticule grid */}
                    <defs>
                        <pattern id="grid" width="38.88" height="19.44" patternUnits="userSpaceOnUse">
                            <path d="M 38.88 0 L 0 0 0 19.44" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width={W} height={H} fill="url(#grid)" />

                    {/* Equator & Prime Meridian */}
                    <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="4,4" />
                    <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="4,4" />

                    {/* Dots */}
                    {dots.map(({ code, count, x, y, r, flag }) => (
                        <g key={code}>
                            <circle
                                cx={x} cy={y} r={r}
                                fill="rgba(96,165,250,0.4)"
                                stroke="rgba(96,165,250,0.8)"
                                strokeWidth="1"
                            />
                            <circle cx={x} cy={y} r={r} fill="rgba(96,165,250,0.15)">
                                <animate attributeName="r" from={r} to={r + 6} dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                            </circle>
                            {r > 10 && (
                                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10" style={{ userSelect: 'none' }}>
                                    {flag}
                                </text>
                            )}
                        </g>
                    ))}
                </svg>
            </div>

            {/* Country table */}
            <div className="space-y-2">
                {sorted.slice(0, 10).map(([code, count], i) => {
                    const info = COUNTRY_CENTROIDS[code] || { name: code, flag: '🌍' };
                    const pct = Math.round((count / maxClicks) * 100);
                    return (
                        <div key={code} className="flex items-center gap-3">
                            <span className="text-base leading-none w-6 text-center">{info.flag}</span>
                            <span className="text-sm text-slate-300 w-32 truncate">{info.name}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-[hsl(230,10%,14%)] overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-blue-500"
                                    style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}
                                />
                            </div>
                            <span className="text-xs text-slate-500 w-10 text-right">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
