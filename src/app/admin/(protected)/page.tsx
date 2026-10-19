import type { Metadata } from "next";
import Editable from "@/components/admin/edit/Editable";
import AdminAwardSection from "@/components/admin/editors/AdminAwardSection";
import ContactEditor from "@/components/admin/editors/ContactEditor";
import { IntroParagraphEditor, ResearchFieldEditor, WhyEditor } from "@/components/admin/editors/HomeTextEditors";
import HomeVisualReplace from "@/components/admin/editors/HomeVisualReplace";
import ContactSection from "@/components/public/home/ContactSection";
import HomeCollage from "@/components/public/home/HomeCollage";
import HomeGallery from "@/components/public/home/HomeGallery";
import HomeHeadline from "@/components/public/home/HomeHeadline";
import HomeMain from "@/components/public/home/HomeMain";
import ResearchFieldGrid from "@/components/public/home/ResearchFieldGrid";
import WhySection from "@/components/public/home/WhySection";
import { DEFAULT_CONTENT } from "@/config/defaults";
import { getPublishedDocument } from "@/services/content";
import { sortAwardsNewestFirst } from "@/services/awards";
import { orderHomeContent } from "@/services/home";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Home 편집" };

// /admin = the public Home (same section components) with editing composed around it.
// The wrapper switches off the Home scroll motion (ani3): editing always sees the final layout.
// Reads the cached latest versions (refreshed by every admin save); each editor saves against
// the version shown here (a newer save by someone else is reported as a conflict).
export default async function AdminHomePage() {
  const [homeDoc, awardsDoc, settingsDoc] = await Promise.all([
    getPublishedDocument("home"),
    getPublishedDocument("awards"),
    getPublishedDocument("settings"),
  ]);
  const home = orderHomeContent(homeDoc?.data ?? DEFAULT_CONTENT.home.data);
  const homeVersion = homeDoc?.version ?? 0;
  const awards = sortAwardsNewestFirst(awardsDoc?.items ?? []);
  const contact = (settingsDoc?.data ?? DEFAULT_CONTENT.settings.data).contact;
  const settingsVersion = settingsDoc?.version ?? 0;

  return (
    <div className={styles.staticMotion}>
      <HomeMain>
        <HomeHeadline />
        <HomeCollage
          visuals={home.visuals.main}
          paragraphs={home.introduction.paragraphs}
          renderVisual={(index, visual) => (
            <HomeVisualReplace group="main" index={index} version={homeVersion}>
              {visual}
            </HomeVisualReplace>
          )}
          renderParagraph={(index, paragraph) => (
            <Editable
              label={`소개 문단 ${index + 1}`}
              editor={<IntroParagraphEditor index={index} value={home.introduction.paragraphs[index]} version={homeVersion} />}
            >
              {paragraph}
            </Editable>
          )}
        />
        <WhySection
          why={home.why}
          renderText={(text) => (
            <Editable label="Why A2F 문구" editor={<WhyEditor why={home.why} version={homeVersion} />}>
              {text}
            </Editable>
          )}
        >
          <ResearchFieldGrid
            fields={home.researchFields}
            renderCard={(field, card) => (
              <Editable label={`연구 분야 ${field.title}`} editor={<ResearchFieldEditor field={field} version={homeVersion} />}>
                {card}
              </Editable>
            )}
          />
        </WhySection>
        <HomeGallery
          visuals={home.visuals.secondary}
          renderVisual={(index, visual) => (
            <HomeVisualReplace group="secondary" index={index} version={homeVersion}>
              {visual}
            </HomeVisualReplace>
          )}
        />
        <AdminAwardSection awards={awards} version={awardsDoc?.version ?? 0} />
        <ContactSection
          contact={contact}
          renderDetails={(details) => (
            <Editable label="연락처" editor={<ContactEditor contact={contact} version={settingsVersion} />}>
              {details}
            </Editable>
          )}
        />
      </HomeMain>
    </div>
  );
}
