import { Link } from 'react-router-dom'
import { PostComposer } from '../components/PostComposer'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'

export function HomePage() {
  const { state, createPost } = useAppData()
  const { currentUser } = useAuth()

  if (!state || !currentUser) {
    return <div className="page-grid"><section className="card loading-card">Loading workspace...</section></div>
  }

  const recentPosts = state.posts
    .filter((post) => post.authorId === currentUser.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 3)

  return (
    <div className="page-grid minimal-home">
      <section className="minimal-hero">
        <div>
          <p className="eyebrow">Appreciation</p>
          <h2 className="hero-title">A quieter place to leave gratitude behind.</h2>
          <p className="hero-text">
            Write one real note for someone who made the week gentler, stronger, or easier to carry.
          </p>
        </div>
        <div className="hero-actions">
          <Link to="/profile" className="button secondary">Open my wall</Link>
          <Link to="/feed" className="button secondary">Browse notes</Link>
        </div>
      </section>

      <section className="content-grid minimal-layout">
        <PostComposer users={state.users} onSubmit={createPost} />
        <aside className="card quiet-panel">
          <p className="eyebrow">Your recent notes</p>
          <div className="quiet-note-list">
            {recentPosts.length > 0 ? recentPosts.map((post) => (
              <article key={post.id} className="mini-post compact-post">
                <p className="mini-title">{post.recipient}</p>
                <p>{post.message}</p>
              </article>
            )) : <p className="muted">You haven&apos;t pinned any notes yet.</p>}
          </div>
        </aside>
      </section>
    </div>
  )
}
