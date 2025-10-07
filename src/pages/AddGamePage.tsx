import { PageContainer } from '~/components/layout/PageContainer'
import { PageHeader } from '~/components/layout/PageHeader'
import { Paragraph } from '~/components/typography/Paragraph'
import { PageTitle } from '~/components/typography/title/PageTitle'
import { AddGameForm } from '~/features/AddGameForm/AddGameForm'

export const AddGamePage = () => (
    <PageContainer className="space-y-8">
        <PageHeader>
            <PageTitle>Dorzuć grę na kupkę</PageTitle>
            <Paragraph>
                Dodaj KOLEJNĄ nową grę do swojej kupki wstydu, na pewno kiedyś w nią
                zagrasz... oczywiście.
            </Paragraph>
        </PageHeader>
        <AddGameForm />
    </PageContainer>
)
