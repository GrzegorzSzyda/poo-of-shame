import { Checkbox } from '~/components/form/Checkbox'
import type { Library } from '~/types/Libraries'

type LibraryItemProps = {
    library: Library
    selectedLibraries: string[]
    onToggleLibrary: (libraryId: string) => void
}

export const LibraryItem = ({
    library,
    selectedLibraries,
    onToggleLibrary,
}: LibraryItemProps) => (
    <label
        key={library.id}
        htmlFor={`library-${library.id}`}
        className="flex items-center gap-3 rounded bg-black/30 px-3 py-2 text-sm font-medium"
    >
        <Checkbox
            id={`library-${library.id}`}
            name="library"
            value={library.id}
            checked={selectedLibraries.includes(library.id)}
            onChange={() => onToggleLibrary(library.id)}
        />
        <span>{library.name}</span>
    </label>
)
