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

type GameOption = {
    id: string
    label: string
}

type Props = {
    mode: 'add' | 'edit'
    initialValues: LibraryEntryDraft
    submitLabel: string
    onSubmit: (values: LibraryEntryDraft) => Promise<void>
    onCancel?: () => void
    errorMessage?: string | null
    gameOptions?: GameOption[]
}

export const LibraryEntryForm = ({
    mode,
    initialValues,
    submitLabel,
    onSubmit,
    onCancel,
    errorMessage,
    gameOptions = [],
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
            {mode === 'add' ? (
                <div>
                    <FormLabel htmlFor="library-game">Gra</FormLabel>
                    <Select
                        id="library-game"
                        value={values.gameId}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                gameId: event.target.value,
                            }))
                        }
                    >
                        <option value="">Wybierz grę</option>
                        {gameOptions.map((game) => (
                            <option key={game.id} value={game.id}>
                                {game.label}
                            </option>
                        ))}
                    </Select>
                </div>
            ) : null}

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
                <FormLabel htmlFor={`${mode}-library-rating`}>Ocena (0-100)</FormLabel>
                <Input
                    id={`${mode}-library-rating`}
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

            <div>
                <FormLabel htmlFor={`${mode}-library-wants`}>
                    Chcę zagrać (0-100)
                </FormLabel>
                <Input
                    id={`${mode}-library-wants`}
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

            <div>
                <FormLabel htmlFor={`${mode}-library-status`}>Status</FormLabel>
                <Select
                    id={`${mode}-library-status`}
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
