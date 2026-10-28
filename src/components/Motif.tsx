type Props = { motif: number }

export function Seal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="3" y="3" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function Motif({ motif }: Props) {
  const kind = Math.abs(motif) % 6
  return (
    <svg className="motif" viewBox="0 0 240 300" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="36" y="28" width="168" height="244" />
        <path d="M36 58h168M36 242h168" />
        {kind === 0 && (
          <>
            <circle cx="120" cy="150" r="46" />
            <circle cx="120" cy="150" r="22" />
            <path d="M120 96v108M74 150h92" />
          </>
        )}
        {kind === 1 && (
          <>
            <path d="M70 196c0-42 22-70 50-70s50 28 50 70" />
            <path d="M84 196c0-30 16-48 36-48s36 18 36 48" />
            <path d="M98 196c0-16 10-26 22-26s22 10 22 26" />
            <path d="M70 196h100" />
          </>
        )}
        {kind === 2 && (
          <>
            <path d="M120 92l40 58-40 58-40-58z" />
            <path d="M120 116l22 34-22 34-22-34z" />
            <path d="M80 150h80" />
          </>
        )}
        {kind === 3 && (
          <>
            <path d="M78 96v108M102 84v132M126 96v108M150 84v132M174 96v108" />
            <path d="M70 150h100" />
          </>
        )}
        {kind === 4 && (
          <>
            <circle cx="120" cy="150" r="52" />
            <circle cx="120" cy="98" r="4" fill="currentColor" stroke="none" />
            <circle cx="166" cy="126" r="4" fill="currentColor" stroke="none" />
            <circle cx="166" cy="174" r="4" fill="currentColor" stroke="none" />
            <circle cx="120" cy="202" r="4" fill="currentColor" stroke="none" />
            <circle cx="74" cy="174" r="4" fill="currentColor" stroke="none" />
            <circle cx="74" cy="126" r="4" fill="currentColor" stroke="none" />
            <circle cx="120" cy="150" r="6" />
          </>
        )}
        {kind === 5 && (
          <>
            <rect x="72" y="102" width="70" height="70" />
            <rect x="98" y="128" width="70" height="70" />
            <path d="M72 102h26M142 128v26M168 198h-26M98 172v-26" />
          </>
        )}
      </g>
    </svg>
  )
}

export function AccessIcon() {
  return (
    <svg className="access-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="4.2" r="1.7" fill="currentColor" />
      <path
        d="M5 9.2h6.2l1.7 3.2M9.2 9.2 7.4 19M12.2 12.6l2.2 2.1 2.4 4.2M14.2 14.6H9.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="15.6" cy="16.2" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
