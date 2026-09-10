const paths = {
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-2.5 5.5L8 16l2.5-5.5Z" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />,
  trophy: (
    <path d="M8 3h8v7a4 4 0 0 1-8 0Zm0 2H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 2v5m-4 2h8" />
  ),
  sound: <path d="m11 4-6 5H2v6h3l6 5Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />,
  muted: <path d="m11 4-6 5H2v6h3l6 5Zm5 5 6 6m0-6-6 6" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .7-1.5 1-1.5 2m0 3h.01" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
    </>
  ),
  fire: (
    <path d="M13 2s2 5-1 8c-2-1-2-3-2-3s-6 5-6 9a8 8 0 0 0 16 0c0-5-3-8-3-8s0 4-2 5c2-6-2-11-2-11Z" />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  flag: <path d="M5 21V3c5-4 9 4 14 0v11c-5 4-9-4-14 0" />,
  leaf: <path d="M20 3C8 1 2 8 5 15c7 7 15 0 15-12ZM3 21l12-12" />,
  check: <path d="m5 12 4 4L20 5" />,
  pause: <path d="M8 5v14M16 5v14" />,
  play: <path d="m8 4 12 8-12 8Z" />,
  bulb: <path d="M8 15a7 7 0 1 1 8 0v3H8Zm1 7h6m-6-4v4m6-4v4" />,
  reset: <path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" />,
  crown: <path d="m3 6 4 4 5-7 5 7 4-4-2 13H5Zm3 17h12" />,
  mountain: <path d="m2 20 8-16 5 10 3-5 5 11ZM7 10l3 2 3-2" />,
  gem: <path d="M7 3h10l4 6-9 12L3 9Zm-4 6h18M10 3l-3 6 5 12 5-12-3-6" />,
  cloud: <path d="M7 18a4 4 0 0 1-.6-7.95A6 6 0 0 1 18 8.5 3.5 3.5 0 0 1 17.5 18Z" />,
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 22v-3a8 8 0 0 1 16 0v3" />
    </>
  ),
}

export default function Icon({ name, size = 20, className = "", ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {paths[name] ?? paths.compass}
    </svg>
  )
}
