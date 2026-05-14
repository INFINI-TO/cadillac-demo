import { motion } from 'framer-motion'
import { useDemoStore } from '../stores/useDemoStore'
import backIcon from '../assets/ic-back.svg'
import { useRef } from 'react'
import backgroundVideo from '../assets/apbck.mp4'

import type { PromptOption } from '../services/cadillacApi'

interface StyleSelectorProps {
  onSelect: (style: string) => void
  onBack: () => void
  /** When set, replaces demo store styles (prompt id is passed to onSelect). */
  prompts?: PromptOption[]
}

export function StyleSelector({ onSelect, onBack, prompts }: StyleSelectorProps) {
  const { styles } = useDemoStore()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const items = prompts?.length ? prompts.map((p) => ({ key: p.id, label: p.label })) : styles.map((s) => ({ key: s, label: s }))

  return (
    <div 
      className="w-full h-full min-h-screen flex flex-col items-center relative overflow-hidden"
      style={{ background: 'rgb(var(--aipb-bg))' }}
    >
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ opacity: 0.1 }}
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>
      
      {/* Dimmed overlay for text readability */}
      <div className="absolute inset-0 z-[1]" style={{ background: 'rgba(17, 17, 17, 0.35)', pointerEvents: 'none' }} />
      
      {/* Title */}
      <div 
        className="relative z-20 flex-shrink-0"
        style={{ 
          paddingLeft: 'clamp(2rem, 3vh, 5rem)', 
          paddingRight: 'clamp(2rem, 3vh, 5rem)', 
          paddingTop: 'clamp(6rem, 10vh, 12rem)', 
          paddingBottom: 'clamp(1rem, 2vh, 3rem)' 
        }}
      >
        <h2 
          className="text-center font-bold uppercase tracking-wide drop-shadow-md"
          style={{ 
            color: 'rgb(var(--aipb-text))',
            fontSize: 'clamp(1.5rem, 3vh, 2.5rem)'
          }}
        >
          Choose your livery
        </h2>
      </div>

      {/* Scrollable Style Grid - 2 columns */}
      <div 
        ref={scrollContainerRef}
        className="flex items-start justify-center relative z-10 no-scrollbar flex-1 overflow-y-auto overflow-x-hidden" 
        style={{ 
          paddingLeft: 'clamp(2rem, 3vh, 5rem)', 
          paddingRight: 'clamp(2rem, 3vh, 5rem)', 
          paddingBottom: 'clamp(1rem, 1.5vh, 2rem)',
          scrollbarWidth: 'none',
        }}
      >
        <style>
          {`
            .style-button {
              padding-top: 0.88rem !important;
              padding-bottom: 0.88rem !important;
              padding-left: 0.88rem !important;
              padding-right: 0.88rem !important;
              font-size: 0.88em !important;
              min-height: calc(2 * 1.5em + 1.76rem) !important;
              line-height: 1.5 !important;
            }
            
            @media (orientation: landscape) {
              .style-grid {
                grid-template-columns: repeat(3, 1fr) !important;
                max-width: clamp(50rem, 70vh, 90rem) !important;
              }
              .landscape-only {
                display: block !important;
              }
            }
          `}
        </style>
        <div 
          className="grid grid-cols-2 style-grid w-full" 
          style={{ gap: 'clamp(1rem, 2vh, 2.5rem)', maxWidth: 'clamp(28rem, 40vh, 60rem)' }}
        >
          {items.map((item, index) => (
            <motion.button
              key={item.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
              whileTap={{ scale: 0.75 }}
              onClick={() => onSelect(item.key)}
              className="style-button w-full py-4 px-4 text-white rounded-mobile font-bold transition-all text-center uppercase tracking-wide shadow-mobile cursor-pointer relative z-20"
              style={{ 
                background: 'var(--aipb-accent-bg)',
                pointerEvents: 'auto' 
              }}
            >
              {item.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Controls - Bottom (flow layout) */}
      <div className="relative z-30 flex-shrink-0 w-full">
        <div 
          className="flex justify-center items-center"
          style={{ 
            gap: 'clamp(1.5rem, 2.5vh, 4rem)', 
            paddingLeft: 'clamp(2rem, 3vh, 5rem)', 
            paddingRight: 'clamp(2rem, 3vh, 5rem)', 
            paddingTop: 'clamp(1rem, 1.5vh, 2rem)',
            paddingBottom: 'clamp(2rem, 3vh, 5rem)' 
          }}
        >
          {/* Back button - round black */}
          <button
            onClick={onBack}
            className="rounded-full flex items-center justify-center transition-all no-select"
            style={{ 
              background: 'rgb(17, 17, 17)',
              width: 'clamp(4rem, 8vh, 12rem)',
              height: 'clamp(4rem, 8vh, 12rem)',
              boxShadow: '0 0 0 clamp(5px, 0.7vh, 12px) rgba(255,255,255,0.4)'
            }}
            aria-label="Back"
          >
            <img
              src={backIcon}
              alt="Back"
              draggable="false"
              style={{
                width: 'clamp(2rem, 4vh, 6rem)',
                height: 'clamp(2rem, 4vh, 6rem)',
                filter: 'brightness(0) invert(1)',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
