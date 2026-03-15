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
    <form 
      className="card composer note-composer" 
      onSubmit={submit}
      aria-labelledby="composer-heading"
      aria-describedby="composer-description"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Create appreciation post</p>
          <h2 id="composer-heading">Capture the moment while it still feels vivid.</h2>
        </div>
        <span className="pill" aria-hidden="true">Write one good note</span>
      </div>

      <div className="note-paper">
        <div className="note-paper-header">
          <span>To someone worth remembering</span>
          <span>Keep it specific</span>
        </div>

        <div className="form-grid">
        <label htmlFor="recipient-input">
          Appreciated person
          <input
            id="recipient-input"
            value={draft.recipient}
            onChange={(event) => setDraft({ ...draft, recipient: event.target.value })}
            placeholder="Sarah Chen"
            required
            aria-required="true"
          />
        </label>
        <label htmlFor="recipient-user-select">
          Link to member profile
          <select
            id="recipient-user-select"
            value={draft.recipientUserId ?? ''}
            onChange={(event) => {
              const nextUser = users.find((user) => user.id === event.target.value)
              setDraft({
                ...draft,
                recipientUserId: event.target.value,
                recipient: nextUser?.name ?? draft.recipient,
              })
            }}
            aria-describedby="recipient-user-hint"
          >
            <option value="">Not a registered member</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
          <span id="recipient-user-hint" className="visually-hidden">Select a registered user to link their profile</span>
        </label>
        <label className="span-2" htmlFor="message-textarea">
          What happened?
          <textarea
            id="message-textarea"
            value={draft.message}
            onChange={(event) => setDraft({ ...draft, message: event.target.value })}
            placeholder="Describe the action and why it mattered."
            rows={5}
            required
            aria-required="true"
            aria-describedby="message-hint"
          />
          <span id="message-hint" className="visually-hidden">Describe the specific action and why it was meaningful</span>
        </label>
        <label htmlFor="category-select">
          Category
          <select 
            id="category-select"
            value={draft.category} 
            onChange={(event) => setDraft({ ...draft, category: event.target.value })}
            aria-label="Select category"
          >
            <option>Teamwork</option>
            <option>Leadership</option>
            <option>Community</option>
            <option>Education</option>
            <option>Support</option>
            <option>Everyday Kindness</option>
          </select>
        </label>
        <label htmlFor="location-input">
          Location
          <input
            id="location-input"
            value={draft.location}
            onChange={(event) => setDraft({ ...draft, location: event.target.value })}
            placeholder="Remote, NYC, campus..."
          />
        </label>
        <label htmlFor="visibility-select">
          Visibility
          <select
            id="visibility-select"
            value={draft.visibility}
            onChange={(event) => setDraft({ ...draft, visibility: event.target.value as Visibility })}
            aria-describedby="visibility-hint"
          >
            <option value="public">Public with name</option>
            <option value="anonymous">Anonymous appreciation</option>
            <option value="private">Private to recipient</option>
          </select>
          <span id="visibility-hint" className="visually-hidden">Public posts appear in the feed, Anonymous hides your name, Private only notifies the recipient</span>
        </label>
        <label htmlFor="gift-amount-input">
          Gift amount
          <input
            id="gift-amount-input"
            value={draft.giftAmount}
            onChange={(event) => setDraft({ ...draft, giftAmount: event.target.value })}
            type="number"
            min="0"
            placeholder="10"
            aria-describedby="gift-amount-hint"
          />
          <span id="gift-amount-hint" className="visually-hidden">Optional: attach a monetary gift amount in USD</span>
        </label>
        <label htmlFor="gift-provider-select">
          Gift provider
          <select
            id="gift-provider-select"
            value={draft.giftProvider}
            onChange={(event) => setDraft({ ...draft, giftProvider: event.target.value as GiftProvider })}
            aria-label="Select gift provider"
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
        <p id="composer-description">Private posts only notify the recipient and stay off the global feed.</p>
        <button 
          type="submit" 
          className="button primary" 
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Publishing...' : 'Publish appreciation'}
        </button>
      </div>
    </form>
  )
}
