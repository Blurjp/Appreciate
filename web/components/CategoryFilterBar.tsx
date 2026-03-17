'use client'

import { GratitudeCategory, CATEGORIES } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  selected: GratitudeCategory | null
  onSelect: (category: GratitudeCategory | null) => void
}

export default function CategoryFilterBar({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
      {/* All button */}
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-subheadline font-medium transition-all whitespace-nowrap',
          selected === null
            ? 'bg-brand-primary text-white shadow-sm'
            : 'bg-brand-surface text-brand-text-secondary border border-brand-border hover:border-brand-text-muted'
        )}
      >
        ⭐ All
      </button>

      {/* Category pills */}
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onSelect(cat.value)}
          className={cn(
            'flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-subheadline font-medium transition-all whitespace-nowrap',
            selected === cat.value
              ? 'text-white shadow-sm'
              : 'bg-brand-card text-brand-text-secondary border border-brand-border hover:border-brand-text-muted'
          )}
          style={
            selected === cat.value
              ? { backgroundColor: cat.color }
              : undefined
          }
        >
          {cat.emoji} {cat.label}
        </button>
      ))}
    </div>
  )
}
