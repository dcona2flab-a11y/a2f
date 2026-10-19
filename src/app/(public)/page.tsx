import AwardSection from "@/components/public/home/AwardSection";
import ContactSection from "@/components/public/home/ContactSection";
import HomeCollage from "@/components/public/home/HomeCollage";
import HomeGallery from "@/components/public/home/HomeGallery";
import HomeHeadline from "@/components/public/home/HomeHeadline";
import HomeMain from "@/components/public/home/HomeMain";
import ResearchFieldGrid from "@/components/public/home/ResearchFieldGrid";
import WhySection from "@/components/public/home/WhySection";
import { getAwards } from "@/services/awards";
import { getHomeContent } from "@/services/home";
import { getSettings } from "@/services/settings";

// Home. The admin (/admin) renders the same sections with editing added around them.
export default async function HomePage() {
  const [home, awards, settings] = await Promise.all([getHomeContent(), getAwards(), getSettings()]);

  return (
    <HomeMain>
      <HomeHeadline />
      <HomeCollage visuals={home.visuals.main} paragraphs={home.introduction.paragraphs} />
      <WhySection why={home.why}>
        <ResearchFieldGrid fields={home.researchFields} />
      </WhySection>
      <HomeGallery visuals={home.visuals.secondary} />
      {/* No placeholder on the public site: the section appears with the first item. */}
      {awards.length > 0 && <AwardSection awards={awards} />}
      <ContactSection contact={settings.contact} />
    </HomeMain>
  );
}
