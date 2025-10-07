import { LIBRARIES } from '~/constants/libraries'

export const getLibrariesByPlatform = (platform: string) =>
    LIBRARIES.filter((library) => library.platform === platform)
