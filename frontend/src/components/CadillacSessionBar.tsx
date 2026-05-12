import logo from '../assets/logo-aiphotobooth-default.svg'
import { logout } from '../services/cadillacApi'
import { useNavigate } from 'react-router-dom'

export function CadillacSessionBar() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      /* ignore */
    }
    navigate('/')
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
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <img
        src={logo}
        alt="Demo"
        draggable="false"
        style={{
          height: 'clamp(2rem, 4vh, 5rem)',
          width: 'auto',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />
      <button
        type="button"
        onClick={handleLogout}
        className="text-sm uppercase tracking-wide px-4 py-2 rounded-lg border border-white/20 text-white/90 hover:bg-white/5"
      >
        Wyloguj
      </button>
    </div>
  )
}
