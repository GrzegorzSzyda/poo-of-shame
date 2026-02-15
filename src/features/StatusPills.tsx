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
    progressStatusSelectorTone,
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
}

export const ProgressStatusPills = ({
    value,
    onChange,
    id,
}: ProgressStatusPillsProps) => (
    <div
        id={id}
        className="bg-bg/40 inline-flex w-full overflow-hidden rounded-xl"
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
                        'hover:bg-text/10 cursor-pointer px-3 py-2 text-sm transition-colors',
                        'flex-1 text-center whitespace-nowrap',
                        progressStatusSelectorTone(status),
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
