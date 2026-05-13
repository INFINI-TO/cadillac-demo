import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatApiError, login, sessionStatus } from '../services/cadillacApi'

export function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await sessionStatus()
        if (cancelled) return
        if (s.authenticated) {
          navigate('/app', { replace: true })
          return
        }
      } catch {
        /* stay on login */
      }
      if (!cancelled) setSessionChecked(true)
    })()
    return () => {
      cancelled = true
    }
  }, [navigate])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username.trim(), password)
      navigate('/app')
    } catch (err) {
      const msg = formatApiError(err)
      setError(
        msg.toLowerCase().includes('invalid credentials') || msg.includes('401')
          ? 'Invalid username or password'
          : msg
      )
    } finally {
      setLoading(false)
    }
  }

  if (!sessionChecked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: 'rgb(var(--aipb-bg))' }}
      >
        <div className="text-white text-xl">Loading…</div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'rgb(var(--aipb-bg))' }}
    >
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="w-full max-w-md space-y-6 p-8 rounded-2xl"
        style={{
          background: 'rgb(17, 17, 17)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <h1
          className="text-center font-bold uppercase tracking-wide"
          style={{ color: 'rgb(var(--aipb-text))', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}
        >
          Cadillac F1 demo
        </h1>
        <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Sign in to launch the demo.
        </p>
        {error && (
          <p className="text-center text-sm text-red-400">{error}</p>
        )}
        <div className="space-y-3">
          <label className="block text-xs uppercase tracking-wider text-white/60">Username</label>
          <input
            className="w-full rounded-lg px-3 py-3 bg-black/40 border border-white/10 text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <label className="block text-xs uppercase tracking-wider text-white/60">Password</label>
          <input
            type="password"
            className="w-full rounded-lg px-3 py-3 bg-black/40 border border-white/10 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full py-3 rounded-lg font-semibold uppercase tracking-wide disabled:opacity-50"
          style={{ background: 'var(--aipb-accent-bg)', color: '#fff' }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </motion.form>
    </div>
  )
}
