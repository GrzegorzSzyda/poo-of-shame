import { PLATFORMS } from '~/constants/platform'
import { cx } from '~/utils/cx'
import { getLibrariesByPlatform } from '~/utils/getLibrariesByPlatform'
import { LibraryItem } from './Library'

type PlatformProps = {
    platformId: keyof typeof PLATFORMS
    selectedLibraries: string[]
    onToggleLibrary: (libraryId: string) => void
}

const COLORS: Record<keyof typeof PLATFORMS, { bg: string; title: string }> = {
    pc: {
        bg: 'bg-teal-900/70',
        title: 'text-slate-100',
    },
    ps: {
        bg: 'bg-blue-900/40',
        title: 'text-[#5c7cff]',
    },
    xbox: {
        bg: 'bg-emerald-900/40',
        title: 'text-[#7ee35c]',
    },
    nintendo: {
        bg: 'bg-red-900/40',
        title: 'text-[#ff6767]',
    },
    other: {
        bg: 'bg-amber-800/30',
        title: 'text-amber-300',
    },
}

export const Platform = ({
    platformId,
    selectedLibraries,
    onToggleLibrary,
}: PlatformProps) => (
    <div
        className={cx(
            'space-y-4 rounded-xl p-4 shadow-md ring-1 shadow-black/20 ring-white/5',
            COLORS[platformId]?.bg,
        )}
    >
        <p
            className={cx(
                "font-['Baloo 2'] text-lg font-semibold tracking-wide text-[#5c7cff] uppercase",
                COLORS[platformId]?.title,
            )}
        >
            {PLATFORMS[platformId]}
        </p>
        <div className="space-y-2">
            {getLibrariesByPlatform(platformId).map((library) => (
                <LibraryItem
                    key={library.id}
                    library={library}
                    selectedLibraries={selectedLibraries}
                    onToggleLibrary={onToggleLibrary}
                />
            ))}
        </div>
    </div>
)
