import { cx } from 'cva'
import { PlatformPillSelector } from './PlatformPills'
import { type Platform } from './libraryShared'

type Props = {
    selected: ReadonlyArray<Platform>
    onToggle: (platform: Platform) => void
    includeNoPlatforms: boolean
    onToggleNoPlatforms: () => void
}

export const PlatformFilterPills = ({
    selected,
    onToggle,
    includeNoPlatforms,
    onToggleNoPlatforms,
}: Props) => (
    <PlatformPillSelector
        selected={[...selected]}
        onToggle={onToggle}
        afterItems={
            <button
                type="button"
                aria-pressed={includeNoPlatforms}
                onClick={onToggleNoPlatforms}
                className={cx(
                    'inline-flex cursor-pointer items-center rounded-full border px-3 py-1 text-xs transition-colors',
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
