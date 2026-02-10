import { PLATFORM_VALUES, PROGRESS_STATUS_VALUES } from './constants'

export type Platform = (typeof PLATFORM_VALUES)[number]
export type ProgressStatus = (typeof PROGRESS_STATUS_VALUES)[number]
