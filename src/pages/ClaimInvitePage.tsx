import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { apiClient } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { ClaimInvite } from '../types'

export function ClaimInvitePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { currentUser, isLoading } = useAuth()
  const [invite, setInvite] = useState<ClaimInvite | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    apiClient
      .getClaimInvite(token)
      .then((payload) => setInvite(payload.invite))
      .catch((inviteError) => setError(inviteError instanceof Error ? inviteError.message : 'Unable to load invite'))
  }, [token])

  if (!token) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="page-grid narrow-page">
      <section className="card composer">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Claim appreciation</p>
            <h2>Attach recognition to your wall.</h2>
          </div>
        </div>
        {error && <p className="report-status">{error}</p>}
        {!invite && !error && <p>Loading invite...</p>}
        {invite && (
          <div className="claim-panel">
            <article className="mini-post">
              <p className="mini-title">{invite.authorName} appreciated {invite.recipient}</p>
              <p>{invite.message}</p>
            </article>
            {!currentUser && !isLoading && (
              <div className="hero-actions">
                <Link to="/login" className="button primary">Sign in to claim</Link>
              </div>
            )}
            {currentUser && (
              <button
                type="button"
                className="button primary"
                onClick={async () => {
                  await apiClient.claimViaInvite(token)
                  navigate('/profile')
                }}
              >
                Claim this appreciation
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
