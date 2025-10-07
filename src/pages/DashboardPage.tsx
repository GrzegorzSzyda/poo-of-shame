import { PageContainer } from '~/components/layout/PageContainer'
import { PageHeader } from '~/components/layout/PageHeader'
import { Paragraph } from '~/components/typography/Paragraph'
import { PageTitle } from '~/components/typography/title/PageTitle'

export const DashboardPage = () => (
    <PageContainer className="space-y-8">
        <PageHeader>
            <PageTitle>Pulpit</PageTitle>
            <Paragraph>
                Twoja główna baza – zbieramy tu statystyki i skróty do najważniejszych
                działań.
            </Paragraph>
        </PageHeader>

        <Paragraph>
            Wkrótce zobaczysz tu podsumowanie postępów, ostatnio dodane gry oraz
            rekomendacje. Na razie jesteśmy w trakcie budowy panelu.
        </Paragraph>
    </PageContainer>
)
