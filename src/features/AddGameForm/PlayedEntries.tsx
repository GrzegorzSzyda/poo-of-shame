import { useState } from 'react'
import { DateInput } from '~/components/form/DateInput'
import { Label } from '~/components/form/Label'
import { NumberInput } from '~/components/form/NumberInput'
import { Select } from '~/components/form/Select'
import { TextInput } from '~/components/form/TextInput'
import { Button } from '~/components/ui/Button'
import { COMPLETION_STATUSES } from '~/constants/completionStatuses'
import { LIBRARIES } from '~/constants/libraries'
import type { PlayedEntry } from '~/types/UserGameEntry'

const FINISHED_DATE_OPTIONS: Array<{
    value: PlayedEntry['finishedDateChoice']
    label: string
}> = [
    { value: 'past', label: 'Dawno' },
    { value: 'recent', label: 'Teraz' },
    { value: 'custom', label: 'Wybierz datę' },
]

type PlayedEntriesProps = {
    playedEntries: PlayedEntry[]
    handleUpdatePlayedEntries: (updatedEntries: PlayedEntry[]) => void
    ownedLibraries: string[]
}

export const PlayedEntries = ({
    playedEntries,
    handleUpdatePlayedEntries,
    ownedLibraries,
}: PlayedEntriesProps) => {
    const [expandedEntries, setExpandedEntries] = useState<Set<number>>(() => new Set())

    const availableLibraries =
        ownedLibraries.length === 0
            ? LIBRARIES
            : LIBRARIES.filter((library) => ownedLibraries.includes(library.id))

    const handleAddEntry = () => {
        const newEntry: PlayedEntry = {
            completionStatus: '',
            finishedDateChoice: 'recent',
            finishedDate: '',
            rate: 0,
            hoursSpent: 0,
            platform: '',
            libraryId: availableLibraries[0]?.id ?? '',
            note: '',
        }

        handleUpdatePlayedEntries([...playedEntries, newEntry])
    }

    const handleRemoveEntry = (entryIndex: number) => {
        handleUpdatePlayedEntries(
            playedEntries.filter((_, currentIndex) => currentIndex !== entryIndex),
        )

        setExpandedEntries((prev) => {
            const next = new Set<number>()
            prev.forEach((value) => {
                if (value === entryIndex) {
                    return
                }

                next.add(value > entryIndex ? value - 1 : value)
            })
            return next
        })
    }

    const updateEntry = (entryIndex: number, updatedFields: Partial<PlayedEntry>) => {
        handleUpdatePlayedEntries(
            playedEntries.map((entry, currentIndex) =>
                currentIndex === entryIndex ? { ...entry, ...updatedFields } : entry,
            ),
        )
    }

    return (
        <div className="space-y-4">
            <Label>Twoje podejścia do gier:</Label>
            <div className="space-y-3">
                {playedEntries.map((entry, index) => {
                    const isExpanded = expandedEntries.has(index)

                    return (
                        <div
                            key={`played-entry-${index}`}
                            className="text-primary-light/80 border-primary-dark/40 space-y-3 rounded-lg border p-3 text-sm"
                        >
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-1">
                                    <Label htmlFor={`played-entry-status-${index}`}>
                                        Status
                                    </Label>
                                    <Select
                                        id={`played-entry-status-${index}`}
                                        value={entry.completionStatus}
                                        onChange={(event) =>
                                            updateEntry(index, {
                                                completionStatus: event.target.value,
                                            })
                                        }
                                    >
                                        <option value="" disabled>
                                            Wybierz status
                                        </option>
                                        {Object.entries(COMPLETION_STATUSES).map(
                                            ([statusId, statusLabel]) => (
                                                <option key={statusId} value={statusId}>
                                                    {statusLabel}
                                                </option>
                                            ),
                                        )}
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label
                                        htmlFor={`played-entry-finished-choice-${index}`}
                                    >
                                        Kiedy (skończyłeś)?
                                    </Label>
                                    <div className="space-y-2">
                                        <Select
                                            id={`played-entry-finished-choice-${index}`}
                                            value={entry.finishedDateChoice}
                                            onChange={(event) => {
                                                const choice = event.target
                                                    .value as PlayedEntry['finishedDateChoice']
                                                updateEntry(index, {
                                                    finishedDateChoice: choice,
                                                    finishedDate:
                                                        choice === 'custom'
                                                            ? entry.finishedDate
                                                            : '',
                                                })
                                            }}
                                        >
                                            {FINISHED_DATE_OPTIONS.map(
                                                ({ value, label }) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ),
                                            )}
                                        </Select>
                                        {entry.finishedDateChoice === 'custom' && (
                                            <DateInput
                                                id={`played-entry-finished-date-${index}`}
                                                value={entry.finishedDate}
                                                onChange={(event) =>
                                                    updateEntry(index, {
                                                        finishedDate: event.target.value,
                                                    })
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={`played-entry-rate-${index}`}>
                                        Ocena
                                    </Label>
                                    <NumberInput
                                        id={`played-entry-rate-${index}`}
                                        value={entry.rate ?? ''}
                                        onChange={(event) =>
                                            updateEntry(index, {
                                                rate:
                                                    event.target.value === ''
                                                        ? 0
                                                        : Number(event.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={`played-entry-library-${index}`}>
                                        Biblioteka
                                    </Label>
                                    <Select
                                        id={`played-entry-library-${index}`}
                                        value={entry.libraryId}
                                        onChange={(event) =>
                                            updateEntry(index, {
                                                libraryId: event.target.value,
                                            })
                                        }
                                    >
                                        <option value="" disabled>
                                            Wybierz bibliotekę
                                        </option>
                                        {availableLibraries.map((library) => (
                                            <option key={library.id} value={library.id}>
                                                {library.name}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                            {!isExpanded && (
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() =>
                                            setExpandedEntries((prev) => {
                                                const next = new Set(prev)
                                                next.add(index)
                                                return next
                                            })
                                        }
                                    >
                                        Uzupełnij więcej informacji
                                    </Button>
                                </div>
                            )}
                            {isExpanded && (
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label htmlFor={`played-entry-hours-${index}`}>
                                            Czas spędzony (w godzinach)
                                        </Label>
                                        <NumberInput
                                            id={`played-entry-hours-${index}`}
                                            value={entry.hoursSpent ?? ''}
                                            onChange={(event) =>
                                                updateEntry(index, {
                                                    hoursSpent:
                                                        event.target.value === ''
                                                            ? 0
                                                            : Number(event.target.value),
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor={`played-entry-platform-${index}`}>
                                            Na czym grałeś
                                        </Label>
                                        <Select
                                            id={`played-entry-platform-${index}`}
                                            value={entry.platform}
                                            onChange={(event) =>
                                                updateEntry(index, {
                                                    platform: event.target.value,
                                                })
                                            }
                                        >
                                            <option value="" disabled>
                                                Wybierz platformę
                                            </option>
                                            {Object.entries(PLATFORMS).map(
                                                ([platformId, platformName]) => (
                                                    <option
                                                        key={platformId}
                                                        value={platformId}
                                                    >
                                                        {platformName}
                                                    </option>
                                                ),
                                            )}
                                        </Select>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <Label htmlFor={`played-entry-note-${index}`}>
                                            Notatka
                                        </Label>
                                        <TextInput
                                            id={`played-entry-note-${index}`}
                                            value={entry.note}
                                            placeholder="Kilka słów o podejściu"
                                            onChange={(event) =>
                                                updateEntry(index, {
                                                    note: event.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={() => handleRemoveEntry(index)}
                                    disabled={playedEntries.length === 1}
                                >
                                    Usuń podejście
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>
            <Button type="button" variant="success" onClick={handleAddEntry}>
                Dodaj nowe podejście
            </Button>
        </div>
    )
}
