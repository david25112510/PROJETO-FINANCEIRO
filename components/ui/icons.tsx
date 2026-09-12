type IconProps = { className?: string };

const base = "stroke-current fill-none";

export function IconDashboard({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="4.5" rx="1.5" />
      <rect x="13.5" y="11" width="7" height="9.5" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function IconReceitas({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}>
      <path d="M12 4v16M6 9l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconDespesas({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}>
      <path d="M12 20V4M6 15l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCartoes({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

export function IconDividas({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 14.5c0 1.1 1.1 2 2.5 2s2.5-.8 2.5-1.8-1-1.5-2.5-1.9-2.5-.8-2.5-1.9S10.6 9 12 9s2.5.8 2.5 1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconFinanciamentos({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}>
      <path d="M3 21h18M4.5 21V9.5L12 4l7.5 5.5V21" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 21v-6h5v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMetas({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function IconRelatorios({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}>
      <path d="M6 3.5h9l4.5 4.5V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M9 12.5h6M9 16h6" strokeLinecap="round" />
    </svg>
  );
}

export function IconInteligencia({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}>
      <path d="M9 18h6M10 21h4" strokeLinecap="round" />
      <path
        d="M12 3a6 6 0 0 0-4 10.5c.6.5 1 1.3 1 2.1V16h6v-.4c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconImportacao({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}>
      <path d="M12 3v12M7.5 10.5 12 15l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 16.5V19a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconEscudo({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}>
      <path
        d="M12 3.5 5 6v5.5c0 4.6 3 7.9 7 9 4-1.1 7-4.4 7-9V6l-7-2.5Z"
        strokeLinejoin="round"
      />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconWhatsapp({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}>
      <path
        d="M12 3.5a8 8 0 0 0-6.9 12l-1 3.5 3.6-1a8 8 0 1 0 4.3-14.5Z"
        strokeLinejoin="round"
      />
      <path
        d="M9 9.3c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .5.4.2.5.6 1.5.6 1.6.1.1.1.3 0 .4-.1.2-.2.3-.3.5-.2.2-.3.3-.1.6.5.8 1 1.4 1.7 1.8.2.1.4.1.5-.1.2-.2.6-.7.8-.9.1-.2.3-.2.5-.1.5.2 1.4.7 1.6.8.2.1.3.1.4.3.1.3.1.9-.2 1.4-.4.5-1.3.9-1.9.9-.9 0-1.9-.3-3.2-1.3-1.7-1.3-2.8-3-3-3.4-.2-.3-.7-1.2-.7-1.9 0-.9.4-1.3.6-1.5Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function IconSearch({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.5-4.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconMenu({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" strokeLinecap="round" />
    </svg>
  );
}

export function IconClose({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}>
      <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
    </svg>
  );
}

export function IconPlus({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export function IconLogout({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}>
      <path d="M15 17.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12h11.5M17 8.5 20.5 12 17 15.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
