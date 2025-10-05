import { PageContainer } from "~/components/layout/PageContainer"
import { PageHeader } from "~/components/layout/PageHeader"
import { Paragraph } from "~/components/typography/Paragraph"
import { SectionTitle } from "~/components/typography/title/SectionTitle"

export const AddGamePage = () => (
    <PageContainer className="space-y-8">
        <PageHeader>
            <SectionTitle>Dorzuć na stos</SectionTitle>
            <Paragraph>
                Dodaj nową grę do kupki – podaj tytuł, platformę i opcjonalne notatki.
            </Paragraph>
        </PageHeader>

        <Paragraph>
            Formularz jest w przygotowaniu. W kolejnych iteracjach pojawi się integracja z
            zewnętrznymi API, by łatwo wyszukiwać gry i dociągać metadane.
        </Paragraph>
    </PageContainer>
)
