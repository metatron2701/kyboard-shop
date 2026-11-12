type IconProps = { className?: string }

export function BagIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M5 8h14l-1 12H6L5 8Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function ArrowIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M5 12h14M14 7l5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function CloseIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function MinusIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function PlusIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
