import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const demoAccounts = [
  { email: 'maya@appreciation.dev', password: 'maya1234', role: 'member' },
  { email: 'alina@appreciation.dev', password: 'alina1234', role: 'moderator' },
]

export function LoginPage() {
  const { currentUser, signIn, error, isLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(demoAccounts[0].email)
  const [password, setPassword] = useState(demoAccounts[0].password)

  if (currentUser) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="page-grid narrow-page">
      <section className="card composer login-paper-shell">
        <div className="section-heading login-heading">
          <div>
            <p className="eyebrow">Sign in</p>
            <h2>Step back into your gratitude wall.</h2>
          </div>
        </div>
        <form
          className="form-grid single-column login-paper"
          onSubmit={async (event) => {
            event.preventDefault()
            try {
              await signIn({ email, password })
              navigate('/')
            } catch {
              return
            }
          }}
        >
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <button type="submit" className="button primary" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        {error && <p className="report-status">{error}</p>}
        <div className="login-hint-list postcard-grid compact-login-grid">
          {demoAccounts.map((account) => (
            <div key={account.email} className="postcard-item login-postcard">
              <p className="mini-title">{account.role}</p>
              <p>{account.email}</p>
              <p>{account.password}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
