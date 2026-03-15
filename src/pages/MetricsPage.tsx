import { useAppData } from '../context/AppDataContext'

export function MetricsPage() {
  const { state } = useAppData()

  if (!state) {
    return <div className="page-grid"><section className="card loading-card">Loading metrics...</section></div>
  }

  const metrics = state.launchMetrics

  return (
    <div className="page-grid moderator-mode">
      <section className="moderator-summary">
        <p className="eyebrow">Moderator metrics</p>
        <h2>Early signals for whether the ritual is working.</h2>
      </section>
      <section className="stats-grid">
        <article className="metric card"><strong>{metrics.weeklyMeaningfulAppreciations}</strong><span>Weekly meaningful appreciations</span></article>
        <article className="metric card"><strong>{metrics.activeGivers}</strong><span>Active givers</span></article>
        <article className="metric card"><strong>{metrics.repeatGiverRate}%</strong><span>Repeat giver rate</span></article>
        <article className="metric card"><strong>{metrics.claimRate}%</strong><span>Recipient claim rate</span></article>
      </section>

      <section className="stats-grid">
        <article className="metric card"><strong>{metrics.recipientOpenRate}%</strong><span>Recipient open rate</span></article>
        <article className="metric card"><strong>{metrics.moderationRate}%</strong><span>Moderation rate</span></article>
      </section>
    </div>
  )
}
