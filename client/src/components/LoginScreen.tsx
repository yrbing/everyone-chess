import { useState } from 'react'
import './LoginScreen.css'

export interface Credentials {
  /** Email address. */
  email: string
  /** Raw password, 6+ characters. */
  password: string
}

interface LoginScreenProps {
  /** Called with credentials when the SIGN IN tab is submitted. */
  onSignIn?: (creds: Credentials) => void
  /** Called with credentials when the SIGN UP tab is submitted. */
  onSignUp?: (creds: Credentials) => void
  /** Called when the player skips the account entirely. */
  onGuest?: () => void
  /** Supply to render a close button; omit to hide it. */
  onClose?: () => void
  /**
   * Server-side failure to show in the notice bar, e.g. 'INVALID EMAIL OR PASSWORD'.
   * Outranks the local password-mismatch hint while set.
   */
  error?: string
  /** Disables every control and shows CONNECTING… on the submit button. */
  pending?: boolean
  /** Show the guest escape hatch. Defaults to true. */
  allowGuest?: boolean
  /** Render inline instead of as a fixed full-screen overlay. */
  inline?: boolean
  /** Called right before switching to the given tab — a good place to clear a stale `error`. */
  onTabChange?: (tab: 'signin' | 'signup') => void
}

type Tab = 'signin' | 'signup'

const TABS: { id: Tab; label: string; desc: string }[] = [
  { id: 'signin', label: 'SIGN IN', desc: 'Existing player' },
  { id: 'signup', label: 'SIGN UP', desc: 'New player' },
]

export function LoginScreen({
  onSignIn,
  onSignUp,
  onGuest,
  onClose,
  error = '',
  pending = false,
  allowGuest = true,
  inline = false,
  onTabChange,
}: LoginScreenProps) {
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)

  const signup = tab === 'signup'

  // Sign-up needs a matching confirmation; sign-in does not ask for one.
  const mismatch = signup && confirm.length > 0 && pass !== confirm
  const ready =
    email.trim().length > 0 &&
    pass.length >= 6 &&
    (!signup || (confirm.length > 0 && !mismatch))

  // A server error outranks a local hint — it is the newer, more specific fact.
  const notice = error || (mismatch ? 'PASSWORDS DO NOT MATCH' : '')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!ready || pending) return
    const creds = { email: email.trim(), password: pass }
    if (signup) onSignUp?.(creds)
    else onSignIn?.(creds)
  }

  function pick(next: Tab) {
    setTab(next)
    setConfirm('')
    onTabChange?.(next)
  }

  return (
    <div className={inline ? 'lg-inline' : 'lg-ov'}>
      <form className="lg-md" onSubmit={submit}>
        {onClose && (
          <button
            type="button"
            className="lg-x"
            onClick={onClose}
            aria-label="Close"
          >
            {'✕'}
          </button>
        )}

        <h1 className="lg-t">
          INSERT
          <i>PLAYER</i>
        </h1>

        <div className="lg-sec">
          <div className="lg-ey">ACCOUNT</div>
          <div className="lg-pair">
            {TABS.map((t) => (
              <button
                type="button"
                key={t.id}
                aria-pressed={tab === t.id}
                className={`lg-pill${tab === t.id ? ' lg-sel' : ''}`}
                onClick={() => pick(t.id)}
              >
                <span className="lg-pill-lb">{t.label}</span>
                <span className="lg-pill-d">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg-sec">
          <div className="lg-ey">CREDENTIALS</div>

          <label className="lg-field">
            <span className="lg-lb">EMAIL</span>
            <input
              className="lg-in"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              disabled={pending}
              onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
            />
          </label>

          <label className="lg-field">
            <span className="lg-lb">PASSWORD</span>
            <span className="lg-wrap">
              <input
                className="lg-in"
                name="password"
                type={show ? 'text' : 'password'}
                autoComplete={signup ? 'new-password' : 'current-password'}
                placeholder="6+ characters"
                value={pass}
                disabled={pending}
                onChange={(e) => setPass(e.target.value)}
              />
              <button
                type="button"
                className="lg-eye"
                aria-pressed={show}
                aria-label={show ? 'Hide password' : 'Show password'}
                onClick={() => setShow((v) => !v)}
              >
                {show ? 'HIDE' : 'SHOW'}
              </button>
            </span>
          </label>

          {signup && (
            <label className="lg-field">
              <span className="lg-lb">CONFIRM</span>
              <input
                className={`lg-in${mismatch ? ' lg-in--bad' : ''}`}
                name="confirmPassword"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repeat password"
                value={confirm}
                disabled={pending}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
          )}

          {notice && (
            <div className="lg-err" role="alert">
              {notice}
            </div>
          )}
        </div>

        <button type="submit" className="lg-go" disabled={!ready || pending}>
          {pending ? 'CONNECTING…' : signup ? 'CREATE PLAYER' : 'PRESS START'}
        </button>

        {allowGuest && (
          <>
            <div className="lg-or">
              <span>OR</span>
            </div>
            <button
              type="button"
              className="lg-guest"
              disabled={pending}
              onClick={onGuest}
            >
              PLAY AS GUEST
            </button>
            <p className="lg-fine">
              Guest games are not saved and carry no rating.
            </p>
          </>
        )}
      </form>
    </div>
  )
}
