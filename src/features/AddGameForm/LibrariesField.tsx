import { Platform } from './Platform'

type LibrariesFieldProps = {
    selectedLibraries: string[]
    onToggleLibrary: (libraryId: string) => void
}

export const LibrariesField = ({
    selectedLibraries,
    onToggleLibrary,
}: LibrariesFieldProps) => (
    <div className="grid gap-8 lg:[grid-template-columns:minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Platform
            platformId="pc"
            selectedLibraries={selectedLibraries}
            onToggleLibrary={onToggleLibrary}
        />
        <div className="grid gap-6 sm:[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)]">
            <Platform
                platformId="ps"
                selectedLibraries={selectedLibraries}
                onToggleLibrary={onToggleLibrary}
            />
            <Platform
                platformId="xbox"
                selectedLibraries={selectedLibraries}
                onToggleLibrary={onToggleLibrary}
            />
            <Platform
                platformId="nintendo"
                selectedLibraries={selectedLibraries}
                onToggleLibrary={onToggleLibrary}
            />
            <Platform
                platformId="other"
                selectedLibraries={selectedLibraries}
                onToggleLibrary={onToggleLibrary}
            />
        </div>
    </div>
)
