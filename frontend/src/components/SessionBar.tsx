import { useDemoStore } from '../stores/useDemoStore'
import logo from '../assets/logo-aiphotobooth-default.svg'

export function SessionBar() {
  const { sessionsRemaining, timeRemainingSeconds } = useDemoStore()

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
      style={{ 
        background: 'rgb(17, 17, 17)',
        paddingTop: 'clamp(0.75rem, 1.5vh, 2rem)', 
        paddingBottom: 'clamp(0.75rem, 1.5vh, 2rem)', 
        paddingLeft: 'clamp(1.5rem, 3vh, 4rem)', 
        paddingRight: 'clamp(1.5rem, 3vh, 4rem)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* Logo */}
      <img 
        src={logo} 
        alt="AI Photo Booth" 
        draggable="false"
        style={{ 
          height: 'clamp(2rem, 4vh, 5rem)', 
          width: 'auto',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />
      
      {/* Stats */}
      <div className="flex items-center" style={{ gap: 'clamp(1.5rem, 3vh, 3rem)' }}>
        <div className="flex items-center" style={{ gap: 'clamp(0.35rem, 0.7vh, 0.75rem)' }}>
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="rgb(6, 182, 212)" 
            strokeWidth="2"
            style={{ width: 'clamp(1.25rem, 2vh, 2rem)', height: 'clamp(1.25rem, 2vh, 2rem)' }}
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span 
            className="text-white font-medium"
            style={{ fontSize: 'clamp(1rem, 1.8vh, 1.5rem)' }}
          >
            {sessionsRemaining}
          </span>
        </div>
        <div className="flex items-center" style={{ gap: 'clamp(0.35rem, 0.7vh, 0.75rem)' }}>
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="rgb(6, 182, 212)" 
            strokeWidth="2"
            style={{ width: 'clamp(1.25rem, 2vh, 2rem)', height: 'clamp(1.25rem, 2vh, 2rem)' }}
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span 
            className="text-white font-medium"
            style={{ fontSize: 'clamp(1rem, 1.8vh, 1.5rem)' }}
          >
            {formatTime(timeRemainingSeconds)}
          </span>
        </div>
      </div>
    </div>
  )
}
