interface CoinIconProps {
  size?: number;
  className?: string;
}

export function CoinIcon({ size = 20, className = "" }: CoinIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Coin"
    >
      <circle cx="12" cy="12" r="10" fill="oklch(0.78 0.14 85)" />
      <circle cx="12" cy="12" r="8" fill="oklch(0.84 0.16 88)" />
      <circle
        cx="12"
        cy="12"
        r="6"
        fill="oklch(0.78 0.14 85)"
        stroke="oklch(0.7 0.12 82)"
        strokeWidth="0.5"
      />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="9"
        fontWeight="bold"
        fill="oklch(0.2 0.04 85)"
        fontFamily="sans-serif"
      >
        ₑ
      </text>
    </svg>
  );
}

export function formatCoins(amount: bigint): string {
  const n = Number(amount);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
