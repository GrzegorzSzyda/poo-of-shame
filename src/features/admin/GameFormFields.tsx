import type { ReactNode } from 'react'
import {
    type GameFormValues,
    type ReleasePrecision,
    releasePrecisionOptions,
} from './releaseForm'

const FieldLabel = ({ children, htmlFor }: { children: ReactNode; htmlFor: string }) => (
    <label htmlFor={htmlFor} className="text-sm text-zinc-300">
        {children}
    </label>
)

export const GameFormFields = ({
    idPrefix,
    values,
    onChange,
}: {
    idPrefix: string
    values: GameFormValues
    onChange: (values: GameFormValues) => void
}) => {
    const setValue = <Key extends keyof GameFormValues>(
        key: Key,
        value: GameFormValues[Key],
    ) => onChange({ ...values, [key]: value })

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                    <FieldLabel htmlFor={`${idPrefix}-title`}>Tytuł</FieldLabel>
                    <input
                        id={`${idPrefix}-title`}
                        value={values.title}
                        onChange={(event) => setValue('title', event.target.value)}
                        className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                        placeholder="Baldur's Gate 3"
                    />
                </div>

                <div className="space-y-1.5">
                    <FieldLabel htmlFor={`${idPrefix}-release-precision`}>
                        Premiera
                    </FieldLabel>
                    <select
                        id={`${idPrefix}-release-precision`}
                        value={values.releasePrecision}
                        onChange={(event) =>
                            setValue(
                                'releasePrecision',
                                event.target.value as ReleasePrecision,
                            )
                        }
                        className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                    >
                        {releasePrecisionOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {values.releasePrecision === 'exact' ? (
                <div className="space-y-1.5">
                    <FieldLabel htmlFor={`${idPrefix}-release-date`}>
                        Data premiery
                    </FieldLabel>
                    <input
                        id={`${idPrefix}-release-date`}
                        type="date"
                        value={values.releaseDate}
                        onChange={(event) => setValue('releaseDate', event.target.value)}
                        className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                    />
                </div>
            ) : null}

            {values.releasePrecision === 'year' ||
            values.releasePrecision === 'quarter' ||
            values.releasePrecision === 'month' ? (
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                        <FieldLabel htmlFor={`${idPrefix}-release-year`}>Rok</FieldLabel>
                        <input
                            id={`${idPrefix}-release-year`}
                            type="number"
                            value={values.releaseYear}
                            onChange={(event) =>
                                setValue('releaseYear', event.target.value)
                            }
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            placeholder="2026"
                        />
                    </div>
                    {values.releasePrecision === 'quarter' ? (
                        <div className="space-y-1.5">
                            <FieldLabel htmlFor={`${idPrefix}-release-quarter`}>
                                Kwartał
                            </FieldLabel>
                            <select
                                id={`${idPrefix}-release-quarter`}
                                value={values.releaseQuarter}
                                onChange={(event) =>
                                    setValue('releaseQuarter', event.target.value)
                                }
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                            >
                                <option value="1">Q1</option>
                                <option value="2">Q2</option>
                                <option value="3">Q3</option>
                                <option value="4">Q4</option>
                            </select>
                        </div>
                    ) : null}
                    {values.releasePrecision === 'month' ? (
                        <div className="space-y-1.5">
                            <FieldLabel htmlFor={`${idPrefix}-release-month`}>
                                Miesiąc
                            </FieldLabel>
                            <select
                                id={`${idPrefix}-release-month`}
                                value={values.releaseMonth}
                                onChange={(event) =>
                                    setValue('releaseMonth', event.target.value)
                                }
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                            >
                                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                                    (month) => (
                                        <option key={month} value={month}>
                                            {String(month).padStart(2, '0')}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>
                    ) : null}
                </div>
            ) : null}

            {values.releasePrecision === 'text' ? (
                <div className="space-y-1.5">
                    <FieldLabel htmlFor={`${idPrefix}-release-text`}>
                        Opis premiery
                    </FieldLabel>
                    <input
                        id={`${idPrefix}-release-text`}
                        value={values.releaseText}
                        onChange={(event) => setValue('releaseText', event.target.value)}
                        className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                        placeholder="early access 2026"
                    />
                </div>
            ) : null}

            <div className="space-y-1.5">
                <FieldLabel htmlFor={`${idPrefix}-cover-url`}>Cover URL</FieldLabel>
                <input
                    id={`${idPrefix}-cover-url`}
                    type="url"
                    value={values.coverUrl}
                    onChange={(event) => setValue('coverUrl', event.target.value)}
                    className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                    placeholder="https://..."
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                />
            </div>
        </>
    )
}
