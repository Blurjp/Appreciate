import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Draft, GiftProvider, User, Visibility } from '../types'

const defaultDraft: Draft = {
  recipient: '',
  recipientUserId: '',
  message: '',
  category: 'Teamwork',
  location: '',
  visibility: 'public',
  giftAmount: '',
  giftProvider: 'None',
}

export function PostComposer({
  users,
  onSubmit,
}: {
  users: User[]
  onSubmit: (draft: Draft) => Promise<void>
}) {
  const [draft, setDraft] = useState<Draft>(defaultDraft)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.recipient.trim() || !draft.message.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit(draft)
      setDraft(defaultDraft)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="card composer note-composer" onSubmit={submit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Create appreciation post</p>
          <h2>Capture the moment while it still feels vivid.</h2>
        </div>
        <span className="pill">Write one good note</span>
      </div>

      <div className="note-paper">
        <div className="note-paper-header">
          <span>To someone worth remembering</span>
          <span>Keep it specific</span>
        </div>

        <div className="form-grid">
        <label>
          Appreciated person
          <input
            value={draft.recipient}
            onChange={(event) => setDraft({ ...draft, recipient: event.target.value })}
            placeholder="Sarah Chen"
            required
          />
        </label>
        <label>
          Link to member profile
          <select
            value={draft.recipientUserId ?? ''}
            onChange={(event) => {
              const nextUser = users.find((user) => user.id === event.target.value)
              setDraft({
                ...draft,
                recipientUserId: event.target.value,
                recipient: nextUser?.name ?? draft.recipient,
              })
            }}
          >
            <option value="">Not a registered member</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </label>
        <label className="span-2">
          What happened?
          <textarea
            value={draft.message}
            onChange={(event) => setDraft({ ...draft, message: event.target.value })}
            placeholder="Describe the action and why it mattered."
            rows={5}
            required
          />
        </label>
        <label>
          Category
          <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
            <option>Teamwork</option>
            <option>Leadership</option>
            <option>Community</option>
            <option>Education</option>
            <option>Support</option>
            <option>Everyday Kindness</option>
          </select>
        </label>
        <label>
          Location
          <input
            value={draft.location}
            onChange={(event) => setDraft({ ...draft, location: event.target.value })}
            placeholder="Remote, NYC, campus..."
          />
        </label>
        <label>
          Visibility
          <select
            value={draft.visibility}
            onChange={(event) => setDraft({ ...draft, visibility: event.target.value as Visibility })}
          >
            <option value="public">Public with name</option>
            <option value="anonymous">Anonymous appreciation</option>
            <option value="private">Private to recipient</option>
          </select>
        </label>
        <label>
          Gift amount
          <input
            value={draft.giftAmount}
            onChange={(event) => setDraft({ ...draft, giftAmount: event.target.value })}
            type="number"
            min="0"
            placeholder="10"
          />
        </label>
        <label>
          Gift provider
          <select
            value={draft.giftProvider}
            onChange={(event) => setDraft({ ...draft, giftProvider: event.target.value as GiftProvider })}
          >
            <option>None</option>
            <option>Venmo</option>
            <option>Cash App</option>
            <option>PayPal</option>
            <option>Gift Card</option>
          </select>
        </label>
        </div>
      </div>

      <div className="composer-footer">
        <p>Private posts only notify the recipient and stay off the global feed.</p>
        <button type="submit" className="button primary" disabled={isSubmitting}>
          {isSubmitting ? 'Publishing...' : 'Publish appreciation'}
        </button>
      </div>
    </form>
  )
}
