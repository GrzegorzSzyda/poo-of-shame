import { Checkbox } from '~/components/form/Checkbox'
import { Label } from '~/components/form/Label'
import { NumberInput } from '~/components/form/NumberInput'
import { TextInput } from '~/components/form/TextInput'
import type { PlayedEntry } from '~/types/UserGameEntry'
import { LibrariesField } from './LibrariesField'
import { PlayedEntries } from './PlayedEntries'
import { useAddGameForm } from './useAddGameForm'

export const AddGameForm = () => {
    const { formData, setValue } = useAddGameForm()

    const handleToggleLibrary = (libraryId: string) => {
        const isSelected = formData.library.includes(libraryId)
        const updatedLibraries = isSelected
            ? formData.library.filter((id) => id !== libraryId)
            : [...formData.library, libraryId]

        setValue('library', updatedLibraries)
    }

    const handleUpdatePlayedEntries = (updatedEntries: PlayedEntry[]) => {
        setValue('playedEntries', updatedEntries)
    }

    return (
        <form className="grid gap-8">
            <div className="space-y-1">
                <Label htmlFor="englishTitle">Angielski tytuł</Label>
                <TextInput
                    id="englishTitle"
                    name="englishTitle"
                    placeholder="The Witcher 3: Wild Hunt"
                    onChange={(event) => setValue('englishTitle', event.target.value)}
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor="polishTitle">Polski tytuł</Label>
                <TextInput
                    id="polishTitle"
                    name="polishTitle"
                    placeholder="Wiedźmin 3: Dziki Gon"
                    onChange={(event) => setValue('polishTitle', event.target.value)}
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor="gameId">Numer id gry</Label>
                <TextInput
                    id="gameId"
                    name="gameId"
                    placeholder="the-witcher-3-wild-hunt"
                    onChange={(event) => setValue('gameId', event.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label>Gdzie posiadasz grę:</Label>
                <LibrariesField
                    selectedLibraries={formData.library}
                    onToggleLibrary={handleToggleLibrary}
                />
            </div>
            <div className="space-y-2">
                <label
                    htmlFor="isPlayed"
                    className="flex items-center gap-3 rounded bg-black/30 px-3 py-2 text-sm font-medium"
                >
                    <Checkbox
                        id="isPlayed"
                        name="isPlayed"
                        checked={formData.isPlayed}
                        onChange={() => setValue('isPlayed', !formData.isPlayed)}
                    />
                    <span>Grałeś/grasz?</span>
                </label>
            </div>
            {!formData.isPlayed && (
                <div className="space-y-1">
                    <Label htmlFor="interestScore">
                        Jak bardzo chce Ci się grać? (0-1)
                    </Label>
                    <NumberInput
                        id="interestScore"
                        name="interestScore"
                        placeholder="0.83"
                        onChange={(event) =>
                            setValue(
                                'interestScore',
                                event.target.value === ''
                                    ? null
                                    : Number(event.target.value),
                            )
                        }
                    />
                </div>
            )}
            {formData.isPlayed && (
                <PlayedEntries
                    playedEntries={formData.playedEntries}
                    handleUpdatePlayedEntries={handleUpdatePlayedEntries}
                    ownedLibraries={formData.library}
                />
            )}
            <div className="space-y-1">
                <Label htmlFor="note">Notka</Label>
                <TextInput
                    id="note"
                    name="note"
                    placeholder="Może warto coś dodać..."
                    onChange={(event) => setValue('note', event.target.value)}
                />
            </div>
        </form>
    )
}
