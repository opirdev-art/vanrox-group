type VanroxLogoProps = {
  size?: 'sm' | 'md'
  showSubtitle?: boolean
}

export function VanroxLogo({ size = 'md', showSubtitle = true }: VanroxLogoProps) {
  const iconSize = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11'
  const titleSize = size === 'sm' ? 'text-xl' : 'text-2xl'
  const subtitleSize = size === 'sm' ? 'text-[0.55rem] tracking-[2px]' : 'text-[0.6rem] tracking-[2.5px]'

  return (
    <>
      <svg className={iconSize} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M22 3L6 9v14c0 9 7 16.5 16 18 9-1.5 16-9 16-18V9L22 3z" fill="#162847" stroke="#7dc242" strokeWidth="1.2"/>
        <path d="M22 11l-7 6h2v7h10v-7h2l-7-6z" fill="white"/>
        <rect x="19" y="18" width="6" height="6" fill="#0d1f3c"/>
        <rect x="20" y="19" width="3" height="2" fill="#7dc242"/>
        <ellipse cx="22" cy="28" rx="8" ry="4" fill="#7dc242" opacity="0.7"/>
      </svg>
      <div className="leading-tight min-w-0">
        <div className={`font-bebas ${titleSize} text-white tracking-[3px]`}>VANROX</div>
        {showSubtitle && (
          <div className={`font-barlow-condensed ${subtitleSize} text-green font-semibold uppercase ${size === 'md' ? 'hidden sm:block' : ''}`}>
            {size === 'sm' ? 'Engineering & Surveying Services' : 'Engineering & Surveying'}
          </div>
        )}
      </div>
    </>
  )
}
