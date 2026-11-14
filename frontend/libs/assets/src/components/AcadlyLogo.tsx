type AcadlyLogoProps = {
  size?: number;
  color?: "foreground" | "white";
};

export function AcadlyLogo({
  size = 40,
  color = "foreground",
}: AcadlyLogoProps) {
  const width = Math.round(size * (150 / 48));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 150 48"
      width={width}
      height={size}
      role="img"
      aria-label="Acadly"
      className={`shrink-0 ${color === "white" ? "text-white" : "text-foreground"}`}
    >
      <defs>
        <linearGradient id="acadly-mark" x1="5" y1="4" x2="43" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34785A" />
          <stop offset="1" stopColor="#173C2C" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="15" fill="url(#acadly-mark)" />
      <rect x="1.5" y="1.5" width="45" height="45" rx="14.5" stroke="#fff" strokeOpacity=".16" />
      <path d="M10 15.8c4.9-1.6 9.2-.8 14 2.3v15.3c-4.8-3.1-9.1-3.9-14-2.3V15.8Z" fill="#F8FBF8" />
      <path d="M38 15.8c-4.9-1.6-9.2-.8-14 2.3v15.3c4.8-3.1 9.1-3.9 14-2.3V15.8Z" fill="#E8F0E9" />
      <path d="M24 18.1v15.3" stroke="#79A58B" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M13.5 21.3c2.8-.6 5.2-.1 7.6 1.1M13.5 25c2.8-.6 5.2-.1 7.6 1.1M34.5 21.3c-2.8-.6-5.2-.1-7.6 1.1M34.5 25c-2.8-.6-5.2-.1-7.6 1.1" stroke="#B8CDBD" strokeLinecap="round" strokeWidth="1.25" />
      <path d="m35.5 7.3 1.2 2.4 2.6.4-1.9 1.9.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.9 2.6-.4 1.2-2.4Z" fill="#F3C96A" />
      <text
        x="59"
        y="31.8"
        fill="currentColor"
        fontFamily="var(--font-inter-face), Inter, sans-serif"
        fontSize="25"
        fontWeight="700"
        letterSpacing="-1.05"
      >
        Acadly
      </text>
    </svg>
  );
}
