import type { Metadata } from "next";
import Editable from "@/components/admin/edit/Editable";
import AdminMemberSection from "@/components/admin/editors/AdminMemberSection";
import {
  ProfessorBasicsEditor,
  ProfessorContactEditor,
  ProfessorPhotosEditor,
  ProfessorSectionEditor,
  TeamIntroImageReplace,
  TeamIntroTextEditor,
} from "@/components/admin/editors/TeamEditors";
import ProfessorPhotos from "@/components/public/team/ProfessorPhotos";
import ProfessorProfile from "@/components/public/team/ProfessorProfile";
import TeamIntro from "@/components/public/team/TeamIntro";
import TeamPage from "@/components/public/team/TeamPage";
import { DEFAULT_CONTENT } from "@/config/defaults";
import { PROFESSOR_SECTIONS } from "@/config/team";
import { getPublishedDocument } from "@/services/content";
import type { Member, MemberType } from "@/types/content";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Team 편집" };

const byType = (items: Member[], type: MemberType) =>
  items.filter((item) => item.type === type).toSorted((a, b) => a.order - b.order);

// /admin/team = the public Team page (same components) with editing composed in. Reads the
// cached latest professor.json / members.json (refreshed by every save). Professor photos do not rotate
// here, so the photo being edited stays in place.
export default async function AdminTeamPage() {
  const [professorDoc, membersDoc] = await Promise.all([getPublishedDocument("professor"), getPublishedDocument("members")]);
  const professor = professorDoc?.data ?? DEFAULT_CONTENT.professor.data;
  const professorVersion = professorDoc?.version ?? 0;
  const members = membersDoc?.items ?? [];
  const membersVersion = membersDoc?.version ?? 0;
  const base = { professor, version: professorVersion };

  return (
    <TeamPage
      top={
        <>
          <TeamIntro
            intro={professor.teamIntro}
            renderText={(text) => (
              <Editable label="소개 문구" editor={<TeamIntroTextEditor {...base} />}>
                {text}
              </Editable>
            )}
            renderImage={(image) => <TeamIntroImageReplace version={professorVersion}>{image}</TeamIntroImageReplace>}
          />
          <ProfessorProfile
            professor={professor}
            renderHeader={(header) => (
              <Editable label="교수 이름과 소속" editor={<ProfessorBasicsEditor {...base} />}>
                {header}
              </Editable>
            )}
            renderContact={(contact) => (
              <Editable label="교수 연락처" panelTitle="교수 연락처" editor={<ProfessorContactEditor {...base} />}>
                {contact || <p className={styles.empty}>등록된 연락처가 없습니다</p>}
              </Editable>
            )}
            renderPhotos={(images) => (
              <Editable label="교수 사진" panelTitle="교수 사진" editor={<ProfessorPhotosEditor {...base} />}>
                <ProfessorPhotos images={images} name={`Prof. ${professor.name}`} autoRotate={false} />
              </Editable>
            )}
            renderSection={(key, section) => (
              <Editable
                label={PROFESSOR_SECTIONS.find((item) => item.key === key)?.title ?? key}
                panelTitle={PROFESSOR_SECTIONS.find((item) => item.key === key)?.title}
                editor={<ProfessorSectionEditor {...base} sectionKey={key} />}
              >
                {section}
              </Editable>
            )}
          />
        </>
      }
    >
      <AdminMemberSection type="STUDENT" id="student" title="Student" members={byType(members, "STUDENT")} version={membersVersion} />
      <AdminMemberSection type="ALUMNI" id="alumni" title="Alumni" members={byType(members, "ALUMNI")} version={membersVersion} />
    </TeamPage>
  );
}
