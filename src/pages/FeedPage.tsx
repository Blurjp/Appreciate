import { PostList } from '../components/PostList'
import { useAppData } from '../context/AppDataContext'

export function FeedPage() {
  const { state, addReaction, addReport, addComment } = useAppData()

  if (!state) {
    return <div className="page-grid"><section className="card loading-card">Loading feed...</section></div>
  }

  const rankedPosts = [...state.posts]
    .filter((post) => post.visibility !== 'private')
    .sort((a, b) => {
      const reactionScoreA = state.reactions.filter((reaction) => reaction.postId === a.id).length
      const reactionScoreB = state.reactions.filter((reaction) => reaction.postId === b.id).length
      return reactionScoreB - reactionScoreA || +new Date(b.createdAt) - +new Date(a.createdAt)
    })

  return (
    <div className="page-grid">
      <PostList
        posts={rankedPosts}
        users={state.users}
        reactions={state.reactions}
        comments={state.comments}
        reports={state.reports}
        title="Notes people chose to leave behind"
        subtitle="A gentler feed of appreciation"
        onReact={addReaction}
        onReport={addReport}
        onComment={addComment}
      />
    </div>
  )
}
