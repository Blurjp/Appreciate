const enterpriseTeams = [
  { team: 'Engineering', appreciations: 124, engagement: '92%', trend: '+18%' },
  { team: 'Marketing', appreciations: 82, engagement: '81%', trend: '+9%' },
  { team: 'Operations', appreciations: 67, engagement: '76%', trend: '+6%' },
]

export function TeamsPage() {
  return (
    <div className="page-grid">
      <section className="card enterprise-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Appreciation for teams</p>
            <h2>Recognition infrastructure for startups, SMBs, and remote teams.</h2>
          </div>
          <span className="pill">Slack, HRIS, performance reviews</span>
        </div>

        <div className="enterprise-grid">
          <div className="team-table">
            {enterpriseTeams.map((team) => (
              <div key={team.team} className="team-row">
                <div>
                  <strong>{team.team}</strong>
                  <p>{team.appreciations} appreciations this month</p>
                </div>
                <div>
                  <strong>{team.engagement}</strong>
                  <p>Participation</p>
                </div>
                <div>
                  <strong>{team.trend}</strong>
                  <p>Monthly trend</p>
                </div>
              </div>
            ))}
          </div>

          <div className="architecture-panel">
            <h3>System architecture</h3>
            <ul>
              <li>Clients: web app, mobile app, Slack command surface</li>
              <li>Core services: user, appreciation, feed, gift, moderation</li>
              <li>Storage: Postgres for records, Redis for feed and rate limits</li>
              <li>Payments: Stripe or wallet integrations for micro-gifts</li>
            </ul>
          </div>
        </div>

        <div className="roadmap-grid">
          <article className="card roadmap-card">
            <p className="eyebrow">Design partner kickoff</p>
            <h2>First 10 startup teams</h2>
            <ul>
              <li>Onboard founders and engineering leads manually</li>
              <li>Trigger first appreciation after sprint review or incident recovery</li>
              <li>Measure recipient open rate and second appreciation rate weekly</li>
            </ul>
          </article>
          <article className="card roadmap-card">
            <p className="eyebrow">Weekly ritual</p>
            <h2>Prompts that create habit</h2>
            <ul>
              <li>Who made your week materially easier?</li>
              <li>Who helped unblock the release?</li>
              <li>Who gave support that should be remembered publicly?</li>
            </ul>
          </article>
        </div>
      </section>
    </div>
  )
}
