import { FloppyDiskIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Button } from '~/components/Button'
import { Form } from '~/components/Form'
import { FormActions } from '~/components/FormActions'
import { FormLabel } from '~/components/FormLabel'
import { InterestPads } from '~/components/InterestPads'
import { RatingStars } from '~/components/RatingStars'
import { PlatformPillSelector } from './PlatformPills'
import { ProgressStatusPills } from './StatusPills'
import {
    type LibraryEntryDraft,
    type Platform,
    progressStatusUsesWantsToPlay,
} from './libraryShared'

type Props = {
    initialValues: LibraryEntryDraft
    submitLabel: string
    onSubmit: (values: LibraryEntryDraft) => Promise<void>
    onCancel?: () => void
}

export const LibraryEntryForm = ({
    initialValues,
    submitLabel,
    onSubmit,
    onCancel,
}: Props) => {
    const [values, setValues] = useState<LibraryEntryDraft>(initialValues)

    useEffect(() => {
        setValues(initialValues)
    }, [initialValues])

    const togglePlatform = (platform: Platform) => {
        setValues((current) => ({
            ...current,
            platforms: current.platforms.includes(platform)
                ? current.platforms.filter((value) => value !== platform)
                : [...current.platforms, platform],
        }))
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        await onSubmit(values)
    }

    return (
        <Form onSubmit={handleSubmit}>
            <div>
                <FormLabel>Platformy</FormLabel>
                <PlatformPillSelector
                    selected={values.platforms}
                    onToggle={togglePlatform}
                />
            </div>

            <div>
                <FormLabel htmlFor="library-edit-status">Status</FormLabel>
                <ProgressStatusPills
                    id="library-edit-status"
                    value={values.progressStatus}
                    onChange={(status) =>
                        setValues((current) => ({
                            ...current,
                            progressStatus: status,
                        }))
                    }
                />
            </div>

            {progressStatusUsesWantsToPlay(values.progressStatus) ? (
                <div>
                    <FormLabel htmlFor="library-edit-wants">Zainteresowanie</FormLabel>
                    <InterestPads
                        id="library-edit-wants"
                        value={Math.round((values.wantsToPlay / 10) * 2) / 2}
                        onChange={(interestOnPads) =>
                            setValues((current) => ({
                                ...current,
                                wantsToPlay: Math.round(interestOnPads * 10),
                            }))
                        }
                    />
                </div>
            ) : (
                <div>
                    <FormLabel htmlFor="library-edit-rating">Ocena</FormLabel>
                    <RatingStars
                        id="library-edit-rating"
                        value={Math.round((values.rating / 10) * 2) / 2}
                        onChange={(ratingInStars) =>
                            setValues((current) => ({
                                ...current,
                                rating: Math.round(ratingInStars * 10),
                            }))
                        }
                    />
                </div>
            )}

            <div>
                <FormLabel htmlFor="library-edit-note">Notatka</FormLabel>
                <textarea
                    id="library-edit-note"
                    value={values.note}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            note: event.target.value,
                        }))
                    }
                    rows={4}
                    maxLength={2000}
                    className="placeholder:text-text/45 min-h-24 w-full resize-y rounded-md border border-teal-300/40 bg-black/20 px-3 py-2 text-base text-teal-100 transition-colors outline-none focus:border-teal-400"
                    placeholder="Dodaj notatkę o tej grze..."
                />
                <div className="text-text/60 mt-1 text-right text-xs">
                    {values.note.length}/2000
                </div>
            </div>

            <FormActions align="center">
                <Button type="submit" startIcon={FloppyDiskIcon}>
                    {submitLabel}
                </Button>
                {onCancel ? (
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Anuluj
                    </Button>
                ) : null}
            </FormActions>
        </Form>
    )
}
