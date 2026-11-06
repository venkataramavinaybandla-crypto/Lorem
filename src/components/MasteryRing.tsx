interface MasteryRingProps {
  percentage: number;
  size?: number;
}

export default function MasteryRing({ percentage, size = 44 }: MasteryRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      title={`Self-test mastery: ${clamped}%`}
      role="img"
      aria-label={`Self-test mastery ${clamped} percent`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ddc0b8"
          strokeOpacity="0.5"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={clamped > 0 ? '#9f4122' : '#ddc0b8'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-[stroke-dasharray] duration-300"
        />
      </svg>
      <span className="absolute text-[10px] font-mono font-bold text-[#9f4122]">
        {clamped}%
      </span>
    </span>
  );
}
