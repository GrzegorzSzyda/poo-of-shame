import type { Libraries } from '~/types/Libraries'

export const LIBRARIES: Libraries = [
    // PC
    { id: 'pc-steam', name: 'Steam', platform: 'pc' },
    { id: 'pc-gog', name: 'GOG', platform: 'pc' },
    { id: 'pc-epic', name: 'Epic Games Store', platform: 'pc' },
    { id: 'pc-amazon-gaming', name: 'Amazon Gaming', platform: 'pc' },
    { id: 'pc-ubisoft-connect', name: 'Ubisoft Connect', platform: 'pc' },
    { id: 'pc-microsoft-store', name: 'Microsoft Store', platform: 'pc' },
    { id: 'pc-disc', name: 'Płyta', platform: 'pc' },
    // PlayStation
    { id: 'ps-ps-store', name: 'PlayStation Store', platform: 'ps' },
    { id: 'ps-ps-plus', name: 'PlayStation Plus', platform: 'ps' },
    { id: 'ps-ps-disc', name: 'Płyta', platform: 'ps' },
    // Xbox
    { id: 'xbox-store', name: 'Xbox Store', platform: 'xbox' },
    { id: 'xbox-disc', name: 'Płyta', platform: 'xbox' },
    // Nintendo
    { id: 'nintendo', name: 'Nintendo eShop', platform: 'nintendo' },
    { id: 'nintendo-cartridge', name: 'Cartridge', platform: 'nintendo' },
    // Other
    { id: 'other', name: 'Inne', platform: 'other' },
]
