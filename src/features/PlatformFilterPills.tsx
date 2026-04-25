import { cx } from 'cva'
import { PlatformPillSelector } from './PlatformPills'
import { type Platform } from './libraryShared'

type Props = {
    selected: ReadonlyArray<Platform>
    onToggle: (platform: Platform) => void
    includeNoPlatforms: boolean
    onToggleNoPlatforms: () => void
    compact?: boolean
}

export const PlatformFilterPills = ({
    selected,
    onToggle,
    includeNoPlatforms,
    onToggleNoPlatforms,
    compact = false,
}: Props) => (
    <PlatformPillSelector
        selected={[...selected]}
        onToggle={onToggle}
        compact={compact}
        afterItems={
            <button
                type="button"
                aria-pressed={includeNoPlatforms}
                onClick={onToggleNoPlatforms}
                className={cx(
                    'inline-flex cursor-pointer items-center rounded-full border px-3 text-xs transition-[padding,color,background-color,border-color] duration-150',
                    compact ? 'py-0.5' : 'py-1',
                    includeNoPlatforms
                        ? 'border-text/45 bg-text/20 text-text'
                        : 'border-text/25 text-text/75 hover:bg-text/10',
                )}
            >
                Nie posiadasz
            </button>
        }
    />
)
