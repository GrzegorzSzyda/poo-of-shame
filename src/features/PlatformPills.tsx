import { cx } from 'cva'
import { type Platform, platformLabel } from './libraryShared'

const toneByPlatform: Record<Platform, string> = {
    ps_disc: 'border-blue-400/45 bg-blue-500/24 text-blue-50',
    ps_store: 'border-blue-400/45 bg-blue-500/24 text-blue-50',
    ps_plus: 'border-blue-400/45 bg-blue-500/24 text-blue-50',
    pc_disc: 'border-slate-400/40 bg-slate-500/18 text-slate-100',
    steam: 'border-blue-300/35 bg-blue-400/12 text-blue-100',
    epic: 'border-zinc-400/35 bg-zinc-400/12 text-zinc-200',
    ea_app: 'border-emerald-400/35 bg-emerald-500/12 text-emerald-200',
    gog: 'border-violet-400/35 bg-violet-500/12 text-violet-200',
    amazon_gaming: 'border-amber-400/35 bg-amber-500/12 text-amber-200',
    ubisoft_connect: 'border-cyan-400/35 bg-cyan-500/12 text-cyan-200',
    xbox: 'border-lime-400/45 bg-lime-500/20 text-lime-100',
    switch: 'border-red-400/45 bg-red-500/20 text-red-100',
    other: 'border-text/30 bg-text/10 text-text',
}

type PlatformPillSelectorProps = {
    selected: Platform[]
    onToggle: (platform: Platform) => void
}

export const PlatformPillSelector = ({
    selected,
    onToggle,
}: PlatformPillSelectorProps) => (
    <div className="flex flex-wrap gap-2">
        {Object.keys(toneByPlatform).map((value) => {
            const platform = value as Platform
            const isSelected = selected.includes(platform)
            return (
                <button
                    key={platform}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onToggle(platform)}
                    className={cx(
                        'inline-flex cursor-pointer items-center rounded-full border px-3 py-1 text-xs transition-colors',
                        isSelected
                            ? toneByPlatform[platform]
                            : 'border-text/25 text-text/75 hover:bg-text/10',
                    )}
                >
                    {platformLabel(platform)}
                </button>
            )
        })}
    </div>
)

type PlatformPillListProps = {
    platforms: ReadonlyArray<Platform>
}

export const PlatformPillList = ({ platforms }: PlatformPillListProps) => (
    <div className="flex flex-wrap gap-2">
        {platforms.length === 0 ? (
            <span className="text-text/80 text-sm">nie posiadasz</span>
        ) : (
            platforms.map((platform) => (
                <span
                    key={platform}
                    className={cx(
                        'inline-flex items-center rounded-full border px-3 py-1 text-xs',
                        toneByPlatform[platform],
                    )}
                >
                    {platformLabel(platform)}
                </span>
            ))
        )}
    </div>
)
