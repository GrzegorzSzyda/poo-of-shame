import {
    CheckCircleIcon,
    GameControllerIcon,
    TriangleIcon,
    TrophyIcon,
    XCircleIcon,
} from '@phosphor-icons/react'
import { cx } from 'cva'
import {
    PROGRESS_STATUS_OPTIONS,
    type ProgressStatus,
    progressStatusDisplayTone,
    progressStatusLabel,
    progressStatusTextTone,
} from './libraryShared'

const statusIcon = (status: ProgressStatus) => {
    switch (status) {
        case 'backlog':
            return TriangleIcon
        case 'playing':
            return GameControllerIcon
        case 'completed':
            return CheckCircleIcon
        case 'done':
            return TrophyIcon
        case 'dropped':
            return XCircleIcon
    }
}

type ProgressStatusPillsProps = {
    value: ProgressStatus
    onChange: (status: ProgressStatus) => void
    id?: string
    size?: 'md' | 'lg'
}

export const ProgressStatusPills = ({
    value,
    onChange,
    id,
    size = 'md',
}: ProgressStatusPillsProps) => (
    <div
        id={id}
        className="inline-flex w-full border-b border-teal-300/30"
        role="radiogroup"
        aria-label="Status"
    >
        {PROGRESS_STATUS_OPTIONS.map((status) => {
            const isActive = value === status
            const StatusIcon = statusIcon(status)
            return (
                <button
                    key={status}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    data-active={isActive}
                    className={cx(
                        'cursor-pointer border-b-2 transition-colors',
                        isActive
                            ? 'border-current'
                            : 'border-transparent opacity-75 hover:opacity-100',
                        progressStatusTextTone(status),
                        size === 'lg' ? 'px-5 py-4 text-lg' : 'px-3 py-2 text-sm',
                        'flex-1 text-center whitespace-nowrap',
                    )}
                    onClick={() => onChange(status)}
                >
                    <span className="inline-flex items-center gap-1.5">
                        <StatusIcon className="h-3.5 w-3.5" />
                        {progressStatusLabel(status)}
                    </span>
                </button>
            )
        })}
    </div>
)

type ProgressStatusPillProps = {
    status: ProgressStatus
    className?: string
}

export const ProgressStatusPill = ({ status, className }: ProgressStatusPillProps) => (
    <span
        className={cx(
            'inline-flex items-center rounded-full border px-3 py-1 text-xs',
            progressStatusDisplayTone(status),
            className,
        )}
    >
        {progressStatusLabel(status)}
    </span>
)
