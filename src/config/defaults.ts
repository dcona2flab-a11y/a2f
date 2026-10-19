import type { DataKey } from "@/config/storage";
import { DEFAULT_TEAM_INTRO_TEXT } from "@/config/team";
import type { DocumentContent } from "@/lib/validation/content";

// Initial content for each Blob document, used only when the document does not exist yet
// (see lib/blob/initialize). Home, settings and the professor profile start from the Figma
// design copy; list data starts empty and is filled through the admin (or the one-time
// content migration). Do not put live production content here.

export const DEFAULT_CONTENT: { [K in DataKey]: DocumentContent<K> } = {
  home: {
    data: {
      introduction: {
        paragraphs: [
          "We focus on UX/BX design as an integrated experience of cognition, sensation, and emotion, exploring the cognitive and experiential mechanisms of experience in digital environments.",
          "We further engage with generative AI as a co-thinking tool that supports designers’ judgment and thinking, investigating AI-mediated design thinking and human–AI co-thinking design models.",
        ],
      },
      why: {
        statementLead: "We study",
        statement:
          "design activity through the cognitive structures of thinking that shape designers’ processes of problem recognition, interpretation, and judgment, and develop this perspective in our research on design thinking.",
        description:
          "A2F 디자인랩은 디자인 활동의 본질을 디자이너의 문제 인식, 해석, 판단 과정에서 작동하는 인지적 차원의 사고 구조로 바라보고 디자인을 기술 중심의 결과물이 아닌 사고의 실현 과정으로 이해, 변화하는 디지털 환경 속에서 디자인 사고·경험·전략에 대해 모색하고자 합니다.",
      },
      // Six fixed slots. Icons are mapped in code by id.
      researchFields: [
        {
          id: "field-01",
          title: "Cognitive Design Activity",
          subtitle: "디자인 활동의 인지적 과정 연구",
          description:
            "디자이너가 문제를 인식하고 아이디어를 발전시키며 해결안을 도출하는 과정에서 나타나는 인지적 메커니즘을 탐구한다.",
          order: 1,
        },
        {
          id: "field-02",
          title: "Design Thinking",
          subtitle: "디자인 씽킹 연구",
          description:
            "사용자 중심의 문제 해결 방법으로서 디자인 씽킹의 원리를 활용하여 다양한 산업 및 조직 맥락에서의 적용을 탐색한다.",
          order: 2,
        },
        {
          id: "field-03",
          title: "Integrated Brand Experience Design",
          subtitle: "통합적 브랜드 경험 디자인 연구",
          description: "다양한 접점에서 브랜드의 일관되고 통합된 경험을 제공할 수 있는 디자인 전략을 연구한다.",
          order: 3,
        },
        {
          id: "field-04",
          title: "Experience Strategy in Digital Contexts",
          subtitle: "디지털 환경에서의 경험 전략 연구",
          description: "디지털 컨텐츠 분야에서 사용자 경험을 설계하고 최적화하는 방법론을 연구한다.",
          order: 4,
        },
        {
          id: "field-05",
          title: "Service Design for User Experience",
          subtitle: "사용자 경험 개선을 위한 서비스 디자인 연구",
          description:
            "사용자 및 이해관계자의 니즈를 토대로 서비스 생태계를 유기적으로 설계, 새로운 가치를 창출하는 인간 중심적 방법론을 연구한다.",
          order: 5,
        },
        {
          id: "field-06",
          title: "Human–AI Co-thinking in Design",
          subtitle: "디자인에서의 인간–AI 공동 사고 연구",
          description:
            "인간과 AI가 상호 보완적으로 사고하며 협업하는 방식을 탐구하고, AI 시대에 적합한 새로운 디자인 프로세스를 제안한다.",
          order: 6,
        },
      ],
      // Photos are uploaded through the admin (Figma mockup photos are placeholders, not seeded).
      visuals: {
        main: [null, null, null],
        secondary: [null, null],
      },
    },
  },

  settings: {
    data: {
      contact: {
        // The A2F logo glyph before "Lab" is decoration rendered by the UI.
        // Figma spells "Gyeonsangnam-do"; seeded with the standard romanization.
        addressLines: ["Lab, C522, Inje University,", "197 Inje-ro, Gimhae-si, Gyeongsangnam-do,", "South Korea"],
        phone: "+82. 055. 320. 3412",
        email: "ryou@inje.ac.kr",
      },
      footerLines: ["2026 A2F Design Lab,", "Department of Multimedia Design,", "Inje University"],
    },
  },

  // Figma Team copy (the professor's real profile). Photos start empty.
  professor: {
    data: {
      teamIntro: { text: DEFAULT_TEAM_INTRO_TEXT },
      name: "Anyoung Ryou",
      nameKo: "류안영",
      title: "교수",
      department: "인제대학교 멀티미디어학과",
      // Figma spells "Gyeonsangnam-do"; seeded with the standard romanization (as settings).
      addressLines: ["Lab, C522, Inje University,", "197 Inje-ro, Gimhae-si, Gyeongsangnam-do,", "South Korea"],
      phone: "+82. 055. 320. 3412",
      email: "ryou@inje.ac.kr",
      education: [
        "(BA) 서울대학교 미술대학 산업디자인과 시각디자인전공",
        "(MA) 부산대학교 예술대학 디자인학과 시각디자인전공",
        "(Ph.D) 부산대학교 예술대학 디자인학과 디자인학전공",
      ],
      experience: [
        "웅진씽크빅 편집개발본부 전집디자인팀 연구원",
        "부산디자인센터 동남권디자인 지원사업 평가위원",
        "Planning Works Studio, 디렉터",
        "(주)The Party 디자인팀장",
        "부산대학교 디자인학과 겸임교수",
        "(주)D-Insight 디자인실장",
        "인제대학교 멀티미디어학부 조교수",
        "인제대학교 멀티미디어학부장 역임",
      ],
      research: [
        "AI 기반 창작 지원 도구의 발전 방향 모색",
        "통합적 사고 중심 디자인 씽킹 수업 모형",
        "디자인 사고의 주요활동 및 핵심요소에 관한 연구",
        "Value Co-creation 유형에 따른 Co-creation 프로세스 개발",
        "Co-creation 실행 단계에 따른 Value Co-creation 유형 : 지역브랜드를 중심으로",
        "디자인 사고를 활용한 지역브랜드 개발에 관한 연구 : 참여디자인의 관점에서",
        "디자인 정체성 형성과 지역브랜드 활성화 사례 연구",
        "지역브랜드 자립화와 디자인정체성 형성에 관한 연구 : 일본 디앤디파트먼트 사례를 중심으로",
      ],
      projects: [
        "공주 중동골목147, 제민천산책로 조성사업 Design system 개발",
        "함안박물관 Design system 개발",
        "우이동산악문화HUB Identity & Design system 개발",
        "이천시립박물관 Identity & Design system 개발",
        "안동임란역사공원 Identity & Design system 개발",
        "오산 Bird Park 자연생태체험관 Design system 개발",
        "국립해양박물관 기획전시, 해양제주 Identity & Design system 개발",
        "영남알프스의길 전시관 Design system 개발",
        "국립부경대학교 실습선 백경호 Identity & Design system 개발",
        "(주)로날드맥도날드하우스 Design system 개발",
        "경기도업사이클플라자 Design system 개발",
        "창원농업문화관 Design system 개발",
        "해양생물테마파크 Design system 개발",
        "세계조개박물관 Identity & Design system 개발",
        "대구학생과학관 Identity & Design system 개발",
        "합천목재문화체험관 Identity & Design system 개발",
        "경상북도곤충체험관 Identity & Design system 개발",
        "상주거꾸로이야기숲전시관 Identity & Design system 개발",
        "안산별망어촌문화관 Design system 개발",
        "효석달빛언덕 Identity & Design system 개발",
        "KIST전북분원연구소체험관 Design system 개발",
        "동아대학교대신요양병원 Brand Identity, Design system 개발",
        "현성MCT선박 Identity & Design system 개발",
        "호텔파라다이스스파 Brand Identity & Design system 개발",
        "여원미디어 우리문화전집 디자인 개발",
        "웅진닷컴 세계문화여행전집 디자인 개발",
        "웅진닷컴 바투바투인물이야기전집 디자인 개발",
        "웅진닷컴 백과사전디자인 개발",
      ],
      images: [],
    },
  },

  awards: { items: [] },
  projects: { items: [] },
  members: { items: [] },
};
