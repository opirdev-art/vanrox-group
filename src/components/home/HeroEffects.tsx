"use client"

import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern"

const GRID_SIZE = 60

export function HeroEffects() {
  return (
    <>
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_70%_60%_at_80%_50%,rgba(125,194,66,0.08)_0%,transparent_70%),radial-gradient(ellipse_50%_80%_at_10%_80%,rgba(22,40,71,0.9)_0%,transparent_60%),linear-gradient(135deg,#0d1f3c_0%,#1a3258_50%,#0d1f3c_100%)]" />

      <div className="absolute inset-0 z-0 opacity-70 transition-opacity duration-700 group-hover:opacity-100 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]">
        <AnimatedGridPattern
          width={GRID_SIZE}
          height={GRID_SIZE}
          numSquares={24}
          maxOpacity={0.35}
          duration={3}
          repeatDelay={1}
          className="stroke-green/8 fill-green/15"
        />
        <InteractiveGridPattern
          width={GRID_SIZE}
          height={GRID_SIZE}
          squares={[48, 24]}
          className="border-none"
          squaresClassName="[&:hover]:fill-green/30 [&:hover]:stroke-green/80 [&:hover]:drop-shadow-[0_0_8px_rgba(125,194,66,0.6)]"
        />
      </div>

      <div className="absolute right-0 top-0 z-0 h-full w-[55%] overflow-hidden opacity-15 transition-all duration-700 group-hover:opacity-40 group-hover:drop-shadow-[0_0_30px_rgba(125,194,66,0.35)] pointer-events-none">
        <svg
          viewBox="0 0 600 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full transition-all duration-700 group-hover:[&_line]:stroke-green group-hover:[&_path]:stroke-green group-hover:[&_circle]:stroke-green"
        >
          <defs>
            <filter id="hero-line-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g className="transition-all duration-700 group-hover:opacity-100" filter="url(#hero-line-glow)">
            <line x1="0" y1="150" x2="600" y2="150" stroke="#7dc242" strokeWidth="0.5" />
            <line x1="0" y1="300" x2="600" y2="300" stroke="#7dc242" strokeWidth="0.5" />
            <line x1="0" y1="450" x2="600" y2="450" stroke="#7dc242" strokeWidth="0.5" />
            <line x1="0" y1="600" x2="600" y2="600" stroke="#7dc242" strokeWidth="0.5" />
            <line x1="150" y1="0" x2="150" y2="700" stroke="#7dc242" strokeWidth="0.5" />
            <line x1="300" y1="0" x2="300" y2="700" stroke="#7dc242" strokeWidth="0.5" />
            <line x1="450" y1="0" x2="450" y2="700" stroke="#7dc242" strokeWidth="0.5" />
            <g stroke="#7dc242" strokeWidth="1">
              <line x1="145" y1="145" x2="155" y2="155" />
              <line x1="155" y1="145" x2="145" y2="155" />
              <line x1="295" y1="295" x2="305" y2="305" />
              <line x1="305" y1="295" x2="295" y2="305" />
              <line x1="445" y1="145" x2="455" y2="155" />
              <line x1="455" y1="145" x2="445" y2="155" />
              <line x1="295" y1="445" x2="305" y2="455" />
              <line x1="305" y1="445" x2="295" y2="455" />
              <line x1="445" y1="445" x2="455" y2="455" />
              <line x1="455" y1="445" x2="445" y2="455" />
              <line x1="145" y1="595" x2="155" y2="605" />
              <line x1="155" y1="595" x2="145" y2="605" />
            </g>
            <path d="M600 350 Q 400 200 200 350 Q 0 500 200 500 Q 400 500 600 350" stroke="#7dc242" strokeWidth="0.8" fill="none" />
            <path d="M600 280 Q 380 100 160 280 Q -60 460 160 430 Q 380 400 600 280" stroke="#7dc242" strokeWidth="0.5" fill="none" />
            <circle cx="300" cy="350" r="80" stroke="#7dc242" strokeWidth="0.6" strokeDasharray="4 6" fill="none" />
            <line x1="300" y1="350" x2="380" y2="350" stroke="#7dc242" strokeWidth="1" />
            <line x1="300" y1="350" x2="350" y2="280" stroke="#7dc242" strokeWidth="1" />
          </g>
        </svg>
      </div>
    </>
  )
}
