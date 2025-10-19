import {
    CheckFatIcon,
    GameControllerIcon,
    HandPalmIcon,
    ListPlusIcon,
    ProhibitInsetIcon,
    QueueIcon,
    RankingIcon,
    StarIcon,
    TrophyIcon,
} from '@phosphor-icons/react'
import { cx } from 'cva'
import type { PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'
import type { UserGame } from '~/types/UserGame'
import { UserGameStatus } from '~/types/UserGameStatus'

type StatusProps = {
    userGame?: UserGame
}

export const Status = ({ userGame }: StatusProps) => {
    if (!userGame) {
        return (
            <List>
                <ListElement>
                    <ListPlusIcon size={30} color={DEFAULT_COLOR} weight="duotone" />
                    <Text>Można dorzucić na kupkę</Text>
                </ListElement>
            </List>
        )
    }
    switch (userGame.status) {
        case UserGameStatus.NotInterested:
            return (
                <List>
                    <ListElement>
                        <ProhibitInsetIcon
                            size={30}
                            color={DEFAULT_COLOR}
                            weight="duotone"
                        />
                        <Text>Nie zamierzam grać</Text>
                    </ListElement>
                </List>
            )
        case UserGameStatus.WantToPlay:
            return (
                <List>
                    <ListElement>
                        <QueueIcon size={30} color="#ece2f9" weight="duotone" />
                        <Text>Chcę w to zagrać</Text>
                    </ListElement>
                    <ListElement>
                        <RankingIcon size={30} color="#ece2f9" weight="duotone" />
                        <Text>{userGame.interest || '---'}</Text>
                    </ListElement>
                </List>
            )

        case UserGameStatus.Playing:
            return (
                <List>
                    <ListElement>
                        <GameControllerIcon size={30} color="#68bbcf" weight="duotone" />
                        <Text className="text-[#68bbcf]">Właśnie gram!</Text>
                    </ListElement>
                </List>
            )
        case UserGameStatus.Done:
            return (
                <List>
                    <ListElement>
                        <CheckFatIcon size={30} color="#66d306" weight="duotone" />
                        <Text className="text-[#66d306]">Ukończyłem!</Text>
                    </ListElement>
                    <ListElement>
                        <StarIcon size={30} color={DEFAULT_COLOR} weight="duotone" />
                        <Text>{userGame.rate}</Text>
                    </ListElement>
                </List>
            )
        case UserGameStatus.Completed:
            return (
                <List>
                    <ListElement>
                        <TrophyIcon size={30} color="#ffd500" weight="duotone" />
                        <Text className="text-[#ffd500]">Wymaksowałem!</Text>
                    </ListElement>
                    <ListElement>
                        <StarIcon size={30} color={DEFAULT_COLOR} weight="duotone" />
                        <Text>{userGame.rate}</Text>
                    </ListElement>
                </List>
            )
        case UserGameStatus.OnHold:
            return (
                <List>
                    <ListElement>
                        <HandPalmIcon size={30} color="#da2727" weight="duotone" />
                        <Text className="text-[#da2727]">Musi poczekać.</Text>
                    </ListElement>
                    <ListElement>
                        <RankingIcon size={30} color={DEFAULT_COLOR} weight="duotone" />
                        <Text>{userGame.interest}</Text>
                    </ListElement>
                </List>
            )
        case UserGameStatus.Dropped:
            return (
                <List>
                    <ListElement>
                        <ProhibitInsetIcon size={30} color="#da2727" weight="duotone" />
                        <Text className="text-[#da2727]">Porzucona.</Text>
                    </ListElement>
                </List>
            )
        default:
            return (
                <List>
                    <ListElement>
                        <ListPlusIcon size={30} color={DEFAULT_COLOR} weight="duotone" />
                        <Text>Można dorzucić na kupkę</Text>
                    </ListElement>
                </List>
            )
    }
}

const DEFAULT_COLOR = '#d8c7ee'

const List = ({ children }: PropsWithChildren) => (
    <div className="flex flex-col gap-1">{children}</div>
)

const ListElement = ({ children }: PropsWithChildren) => (
    <div className="flex items-center gap-2">{children}</div>
)

const Text = ({ className, children }: PropsWithChildren<{ className?: string }>) => (
    <div className={twMerge(cx('text-[#d8c7ee]', className))}>{children}</div>
)
