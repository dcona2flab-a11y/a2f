import type { Metadata } from "next";
import MemberSection from "@/components/public/team/MemberSection";
import ProfessorProfile from "@/components/public/team/ProfessorProfile";
import TeamIntro from "@/components/public/team/TeamIntro";
import TeamPage from "@/components/public/team/TeamPage";
import { DEFAULT_CONTENT } from "@/config/defaults";
import { getMembers, getProfessor } from "@/services/team";

export const metadata: Metadata = { title: "Team" };

// Team: intro, professor, Student, Alumni. An empty Student / Alumni list hides its section.
// The admin (/admin/team) renders the same components with editing composed in.
export default async function TeamListPage() {
  const [professor, students, alumni] = await Promise.all([getProfessor(), getMembers("STUDENT"), getMembers("ALUMNI")]);
  const profile = professor ?? DEFAULT_CONTENT.professor.data;
  return (
    <TeamPage
      top={
        <>
          <TeamIntro intro={profile.teamIntro} />
          <ProfessorProfile professor={profile} />
        </>
      }
    >
      {students.length > 0 && <MemberSection id="student" title="Student" members={students} />}
      {alumni.length > 0 && <MemberSection id="alumni" title="Alumni" members={alumni} />}
    </TeamPage>
  );
}
