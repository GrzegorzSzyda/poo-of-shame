import { PageContainer } from "~/components/layout/PageContainer"
import { PageHeader } from "~/components/layout/PageHeader"
import { Paragraph } from "~/components/typography/Paragraph"
import { SectionTitle } from "~/components/typography/title/SectionTitle"

export const BacklogPage = () => (
    <PageContainer className="space-y-8">
        <PageHeader>
            <SectionTitle>Twoja kupka</SectionTitle>
            <Paragraph>
                Lista gier, do których chcesz wrócić. Oznaczaj, sortuj, planuj – kolejka
                musi być pod kontrolą.
            </Paragraph>
        </PageHeader>

        <Paragraph>
            Niedługo pojawią się tu filtry, statystyki i możliwość oznaczania gier jako
            „na ukończeniu” lub „odłożone”.
        </Paragraph>
    </PageContainer>
)
