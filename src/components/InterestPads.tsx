import { GameControllerIcon } from '@phosphor-icons/react'
import { cx } from 'cva'
import {
    type CSSProperties,
    type KeyboardEvent,
    type MouseEvent,
    type PointerEvent,
    useRef,
} from 'react'

const clampToRange = (value: number, max: number) => Math.min(max, Math.max(0, value))

const clampToHalfStep = (value: number, max: number) =>
    clampToRange(Math.round(value * 2) / 2, max)

type InterestPadsProps = {
    value: number
    onChange: (value: number) => void
    max?: number
    disabled?: boolean
    id?: string
}

export const InterestPads = ({
    value,
    onChange,
    max = 10,
    disabled = false,
    id,
}: InterestPadsProps) => {
    const normalizedValue = clampToHalfStep(value, max)
    const rowRef = useRef<HTMLDivElement | null>(null)
    const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
    const isDraggingRef = useRef(false)
    const activePointerIdRef = useRef<number | null>(null)

    const changeValue = (nextValue: number) => {
        if (disabled) return
        onChange(clampToHalfStep(nextValue, max))
    }

    const handleItemClick = (event: MouseEvent<HTMLButtonElement>, index: number) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const isLeftHalf = event.clientX - rect.left < rect.width / 2
        changeValue(index + (isLeftHalf ? 0.5 : 1))
    }

    const changeValueFromClientX = (clientX: number) => {
        const items = itemRefs.current.filter(
            (item): item is HTMLButtonElement => item !== null,
        )
        if (items.length === 0) return

        const firstItem = items[0]
        const lastItem = items[items.length - 1]
        if (!firstItem || !lastItem) return

        const firstRect = firstItem.getBoundingClientRect()
        const lastRect = lastItem.getBoundingClientRect()
        if (clientX <= firstRect.left) {
            changeValue(0)
            return
        }
        if (clientX >= lastRect.right) {
            changeValue(max)
            return
        }

        for (const [index, item] of items.entries()) {
            const rect = item.getBoundingClientRect()
            const prevItem = index > 0 ? items[index - 1] : undefined
            const nextItem = index < items.length - 1 ? items[index + 1] : undefined
            const prevRect = prevItem ? prevItem.getBoundingClientRect() : null
            const nextRect = nextItem ? nextItem.getBoundingClientRect() : null

            const leftBoundary = prevRect ? (prevRect.right + rect.left) / 2 : rect.left
            const center = rect.left + rect.width / 2
            const rightBoundary = nextRect ? (rect.right + nextRect.left) / 2 : rect.right

            if (clientX < leftBoundary) continue
            if (clientX <= center) {
                changeValue(index + 0.5)
                return
            }
            if (clientX <= rightBoundary) {
                changeValue(index + 1)
                return
            }
        }
    }

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (disabled) return
        event.preventDefault()
        isDraggingRef.current = true
        activePointerIdRef.current = event.pointerId
        event.currentTarget.setPointerCapture(event.pointerId)
        changeValueFromClientX(event.clientX)
    }

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || activePointerIdRef.current !== event.pointerId) {
            return
        }
        changeValueFromClientX(event.clientX)
    }

    const finishPointerDrag = (event: PointerEvent<HTMLDivElement>) => {
        if (activePointerIdRef.current !== event.pointerId) return
        isDraggingRef.current = false
        activePointerIdRef.current = null
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
        }
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault()
            changeValue(normalizedValue + 0.5)
            return
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault()
            changeValue(normalizedValue - 0.5)
            return
        }

        if (event.key === 'Home') {
            event.preventDefault()
            changeValue(0)
            return
        }

        if (event.key === 'End') {
            event.preventDefault()
            changeValue(max)
        }
    }

    return (
        <div
            id={id}
            className={cx(
                'rounded-md bg-black/20 px-3 py-2',
                disabled ? 'opacity-70' : undefined,
            )}
            role="slider"
            aria-label="Zainteresowanie"
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={normalizedValue}
            aria-valuetext={`${normalizedValue} na ${max}`}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={handleKeyDown}
        >
            <div
                ref={rowRef}
                className="flex touch-none flex-wrap items-center gap-1.5"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishPointerDrag}
                onPointerCancel={finishPointerDrag}
            >
                {Array.from({ length: max }).map((_, index) => {
                    const number = index + 1
                    const fillLevel =
                        normalizedValue >= number
                            ? 1
                            : normalizedValue >= number - 0.5
                              ? 0.5
                              : 0

                    return (
                        <button
                            key={number}
                            type="button"
                            disabled={disabled}
                            title={`${number - 0.5} - ${number}`}
                            onClick={(event) => handleItemClick(event, index)}
                            ref={(element) => {
                                itemRefs.current[index] = element
                            }}
                            className="relative h-11 w-11 cursor-pointer rounded-sm disabled:cursor-default"
                        >
                            <span className="text-text/25 absolute inset-0 inline-flex items-center justify-center">
                                <GameControllerIcon
                                    className="h-8 w-8"
                                    weight="regular"
                                />
                            </span>
                            <span
                                className="absolute inset-0 inline-flex items-center justify-center text-teal-300"
                                style={
                                    {
                                        clipPath: `inset(0 ${100 - fillLevel * 100}% 0 0)`,
                                    } as CSSProperties
                                }
                            >
                                <GameControllerIcon className="h-8 w-8" weight="fill" />
                            </span>
                        </button>
                    )
                })}
            </div>
            <div className="text-text/70 mt-2 text-xs">
                Zainteresowanie: {normalizedValue} / 10
            </div>
        </div>
    )
}
