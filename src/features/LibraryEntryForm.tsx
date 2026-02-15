import { FloppyDiskIcon, XIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Button } from '~/components/Button'
import { Form } from '~/components/Form'
import { FormActions } from '~/components/FormActions'
import { FormLabel } from '~/components/FormLabel'
import { Input } from '~/components/Input'
import { Select } from '~/components/Select'
import {
    type LibraryEntryDraft,
    PLATFORM_OPTIONS,
    PROGRESS_STATUS_OPTIONS,
    type Platform,
    type ProgressStatus,
} from './libraryShared'

const shouldShowWantsToPlay = (status: ProgressStatus) =>
    status === 'backlog' || status === 'playing'

type Props = {
    initialValues: LibraryEntryDraft
    submitLabel: string
    onSubmit: (values: LibraryEntryDraft) => Promise<void>
    onCancel?: () => void
    errorMessage?: string | null
}

export const LibraryEntryForm = ({
    initialValues,
    submitLabel,
    onSubmit,
    onCancel,
    errorMessage,
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
                <div className="flex flex-wrap gap-3">
                    {PLATFORM_OPTIONS.map((platform) => (
                        <label
                            key={platform}
                            className="inline-flex items-center gap-2 text-sm"
                        >
                            <input
                                type="checkbox"
                                checked={values.platforms.includes(platform)}
                                onChange={() => togglePlatform(platform)}
                            />
                            {platform}
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <FormLabel htmlFor="library-edit-status">Status</FormLabel>
                <Select
                    id="library-edit-status"
                    value={values.progressStatus}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            progressStatus: event.target.value as ProgressStatus,
                        }))
                    }
                >
                    {PROGRESS_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </Select>
            </div>

            {shouldShowWantsToPlay(values.progressStatus) ? (
                <div>
                    <FormLabel htmlFor="library-edit-wants">
                        Zainteresowanie (0-100)
                    </FormLabel>
                    <Input
                        id="library-edit-wants"
                        type="number"
                        min={0}
                        max={100}
                        value={values.wantsToPlay}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                wantsToPlay: Number(event.target.value),
                            }))
                        }
                    />
                </div>
            ) : (
                <div>
                    <FormLabel htmlFor="library-edit-rating">Ocena (0-100)</FormLabel>
                    <Input
                        id="library-edit-rating"
                        type="number"
                        min={0}
                        max={100}
                        value={values.rating}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                rating: Number(event.target.value),
                            }))
                        }
                    />
                </div>
            )}

            <FormActions align="center">
                <Button type="submit" startIcon={FloppyDiskIcon}>
                    {submitLabel}
                </Button>
                {onCancel ? (
                    <Button
                        type="button"
                        variant="secondary"
                        startIcon={XIcon}
                        onClick={onCancel}
                    >
                        Anuluj
                    </Button>
                ) : null}
            </FormActions>
            {errorMessage ? <div className="text-red-700">{errorMessage}</div> : null}
        </Form>
    )
}
