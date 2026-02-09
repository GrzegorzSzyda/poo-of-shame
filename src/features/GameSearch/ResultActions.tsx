import type { IgdbGame } from '~/api/IgdbGame'
import { Button } from '~/components/Button'

type ResultActionsProps = {
    game: IgdbGame
}

export const ResultActions = ({ game }: ResultActionsProps) => {
    const handleAddToPoo = () => {}

    return (
        <div>
            <Button onClick={handleAddToPoo} variant="secondary">
                Dodaj do kupki
            </Button>
        </div>
    )
}
