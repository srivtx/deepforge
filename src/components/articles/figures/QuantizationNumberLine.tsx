const T = 2.5;
const SCALE = T / 127;
const AX0 = 50;
const AX1 = 730;
const AY = 156;

function px(v: number): number {
  return AX0 + ((v + 6) / 12) * (AX1 - AX0);
}

function qOf(v: number): number {
  const clipped = Math.max(-T, Math.min(T, v));
  return Math.round(clipped / SCALE);
}

const SAMPLES = [
  { v: -1.9, outlier: false },
  { v: -0.4, outlier: false },
  { v: 1.2, outlier: false },
  { v: 2.1, outlier: false },
  { v: 5.2, outlier: true },
];

const CODE_QS = [-120, -100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100, 120];

const INT8_TICKS = [0, 0.019685, 0.03937, 0.059055, 0.07874];
const FP8_TICKS = [
  0, 0.001953, 0.003906, 0.005859, 0.007812, 0.011719, 0.015625, 0.021484,
  0.029297, 0.040039, 0.054688, 0.074219,
];

const FX0 = 120;
const FX1 = 720;
const FX_DOMAIN = 0.08;

function fx(v: number): number {
  return FX0 + (v / FX_DOMAIN) * (FX1 - FX0);
}

export function QuantizationNumberLine() {
  return (
    <svg
      viewBox="0 0 760 345"
      role="img"
      aria-labelledby="quantnl-title quantnl-desc"
      className="h-auto w-full"
    >
      <title id="quantnl-title">
        Mapping a float range onto int8 codes with an outlier clipped
      </title>
      <desc id="quantnl-desc">
        A number line from minus 6 to 6. The clip threshold is 2.5, so the
        quantizable band runs from minus 2.5 to 2.5 with scale about 0.0197 and
        256 uniform codes. Sample weights sit near the line; one outlier at 5.2
        falls outside the band and is clipped to 2.5, producing an error of 2.7.
        A lower inset compares int8 levels, evenly spaced near zero, with fp8
        e4m3 levels, which pack tightly near zero.
      </desc>
      <defs>
        <marker
          id="quantnl-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 10 5 0 10z" className="fill-warning" />
        </marker>
      </defs>

      <text x={30} y={28} className="fill-ink text-[12.5px] font-medium">
        int8: 256 uniform codes over the clipped range
      </text>
      <text x={30} y={44} className="fill-mute text-[9.5px] font-mono">
        t = 2.5 &middot; scale = t / 127 &asymp; 0.0197 &middot; q = round(x /
        scale) &middot; x&#770; = q &middot; scale
      </text>
      <text x={730} y={28} textAnchor="end" className="fill-accent text-[10px] font-mono">
        one outlier coarsens every value
      </text>

      <line x1={px(-6)} y1={AY} x2={px(6)} y2={AY} className="stroke-hairline" strokeWidth="1.5" />
      {Array.from({ length: 13 }, (_, i) => i - 6).map((v) => (
        <g key={v}>
          <line x1={px(v)} y1={AY - 4} x2={px(v)} y2={AY + 4} className="stroke-hairline" />
          <text
            x={px(v)}
            y={AY + 20}
            textAnchor="middle"
            className="fill-mute text-[9px] font-mono"
          >
            {v}
          </text>
        </g>
      ))}

      <rect x={px(-T)} y={92} width={px(T) - px(-T)} height={64} className="fill-accent/5" />
      <line
        x1={px(-T)}
        y1={92}
        x2={px(-T)}
        y2={AY}
        strokeDasharray="4 4"
        className="stroke-accent/60"
      />
      <line
        x1={px(T)}
        y1={92}
        x2={px(T)}
        y2={AY}
        strokeDasharray="4 4"
        className="stroke-accent/60"
      />
      <text x={px(-T)} y={86} textAnchor="middle" className="fill-accent text-[9px] font-mono">
        &minus;t = &minus;2.5
      </text>
      <text x={px(T)} y={86} textAnchor="middle" className="fill-accent text-[9px] font-mono">
        +t = +2.5
      </text>

      {CODE_QS.map((q) => (
        <line
          key={q}
          x1={px(q * SCALE)}
          y1={AY - 7}
          x2={px(q * SCALE)}
          y2={AY + 7}
          strokeOpacity="0.4"
          className="stroke-accent"
        />
      ))}
      <text x={px(-T)} y={AY + 34} textAnchor="middle" className="fill-accent text-[9px] font-mono">
        q = &minus;127
      </text>
      <text x={px(0)} y={AY + 34} textAnchor="middle" className="fill-accent text-[9px] font-mono">
        q = 0
      </text>
      <text x={px(T)} y={AY + 34} textAnchor="middle" className="fill-accent text-[9px] font-mono">
        q = +127
      </text>

      {SAMPLES.map((sample) => (
        <g key={sample.v}>
          <line
            x1={px(sample.v)}
            y1={114}
            x2={px(sample.v)}
            y2={AY}
            strokeDasharray="2 4"
            className="stroke-mute"
            strokeOpacity="0.6"
          />
          <circle
            cx={px(sample.v)}
            cy={110}
            r={4}
            className={sample.outlier ? "fill-warning" : "fill-ink"}
          />
        </g>
      ))}
      <text
        x={px(5.2) - 8}
        y={98}
        textAnchor="end"
        className="fill-warning text-[10px] font-mono"
      >
        5.20
      </text>
      <path
        d={`M${px(5.2) - 10} 122 L${px(T) + 12} 122`}
        fill="none"
        strokeWidth="1.2"
        markerEnd="url(#quantnl-arrow)"
        className="stroke-warning"
      />
      <text
        x={(px(5.2) + px(T)) / 2 + 4}
        y={138}
        textAnchor="middle"
        className="fill-warning text-[9.5px] font-mono"
      >
        clipped to 2.50 &middot; error 2.70
      </text>

      <text x={30} y={218} className="fill-body-mid text-[10px] font-mono">
        x = 1.20 &rarr; q = {qOf(1.2)} &rarr; x&#770; = {(qOf(1.2) * SCALE).toFixed(3)} &middot;
        error 0.001
      </text>
      <text x={30} y={234} className="fill-warning text-[10px] font-mono">
        x = 5.20 &rarr; q = {qOf(5.2)} (clipped) &rarr; x&#770; ={" "}
        {(qOf(5.2) * SCALE).toFixed(3)} &middot; error 2.700
      </text>

      <path d="M30 252H730" fill="none" className="stroke-hairline" />

      <text x={30} y={272} className="fill-ink text-[11px] font-medium">
        same 8 bits near zero &middot; fp8 e4m3 packs levels where they matter
      </text>

      <text x={40} y={296} className="fill-body-mid text-[9.5px] font-mono">
        int8
      </text>
      <line x1={FX0} y1={294} x2={FX1} y2={294} className="stroke-hairline" />
      {INT8_TICKS.map((v) => (
        <line
          key={`i-${v}`}
          x1={fx(v)}
          y1={288}
          x2={fx(v)}
          y2={300}
          className="stroke-body-mid"
        />
      ))}

      <text x={40} y={322} className="fill-body-mid text-[9.5px] font-mono">
        fp8
      </text>
      <line x1={FX0} y1={320} x2={FX1} y2={320} className="stroke-hairline" />
      {FP8_TICKS.map((v) => (
        <line
          key={`f-${v}`}
          x1={fx(v)}
          y1={314}
          x2={fx(v)}
          y2={326}
          className="stroke-accent"
        />
      ))}
      <text x={FX0} y={340} className="fill-mute text-[9px] font-mono">
        0
      </text>
      <text x={FX1} y={340} textAnchor="end" className="fill-mute text-[9px] font-mono">
        0.08
      </text>
      <text x={FX1} y={272} textAnchor="end" className="fill-mute text-[9.5px] font-mono">
        fp8 steps are relative, not fixed
      </text>
    </svg>
  );
}
