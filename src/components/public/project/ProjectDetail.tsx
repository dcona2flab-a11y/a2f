import Image from "next/image";
import type { ReactNode } from "react";
import PeopleList from "@/components/public/people/PeopleList";
import ScrollToTop from "@/components/public/ui/ScrollToTop";
import { formatDisplayDate } from "@/lib/utils/date";
import type { Project } from "@/types/content";
import ProjectTag from "./ProjectTag";
import styles from "./ProjectDetail.module.css";

type Wrap = (node: ReactNode) => ReactNode;

type Props = {
  project: Project;
  // Admin composition hooks (neutral slots; the public page passes none). A given hook also
  // renders its area when empty, so it can be filled in. `renderImages` wraps the
  // representative image area (the images editor handles all images).
  toolbar?: ReactNode;
  renderHeader?: Wrap;
  renderBody?: Wrap;
  renderImages?: Wrap;
  renderMember?: Wrap;
};

const identity: Wrap = (node) => node;
const SIZES_LEAD = "(min-width: 1440px) 58vw, 100vw";
const SIZES_FULL = "100vw";

// Project detail (Figma 365 0:1397 / 768 0:1777 / 1440 0:2597 / 1920 0:818).
// 1440+: title/date, then body → tags → member on the left and the representative image on the
// right, the other images below at full width. Below 1440: body, tags, all images, member.
// Every image keeps its original ratio.
export default function ProjectDetail({ project, toolbar, renderHeader = identity, renderBody, renderImages, renderMember }: Props) {
  const [lead, ...rest] = project.images;
  const showBody = Boolean(project.body) || Boolean(renderBody);
  const showLead = Boolean(lead) || Boolean(renderImages);
  const showMember = Boolean(project.member) || Boolean(renderMember);
  const alt = (index: number) => project.images[index].alt || `${project.title} 이미지 ${index + 1}`;

  return (
    <main className={styles.main}>
      {toolbar}
      <article className={styles.detail}>
        {renderHeader(
          <header className={styles.header}>
            <h1 className={styles.title}>{project.title}</h1>
            <p className={styles.date}>
              <time dateTime={project.date}>{formatDisplayDate(project.date)}</time>
            </p>
          </header>,
        )}
        <div className={styles.content}>
          <div className={styles.text}>
            {showBody && <div className={styles.bodyCell}>{(renderBody ?? identity)(<ProjectBody body={project.body} />)}</div>}
            <p className={styles.tags}>
              <ProjectTag category={project.category} label={project.category} size="detail" />
              {project.customTag && <ProjectTag label={project.customTag} size="detail" />}
            </p>
            {showMember && (
              <div className={styles.memberCell}>
                {(renderMember ?? identity)(<PeopleList people={project.member ? [project.member] : []} label="Member" />)}
              </div>
            )}
          </div>
          {showLead && (
            <div className={styles.leadCell}>
              {(renderImages ?? identity)(
                lead ? (
                  <Image
                    className={styles.image}
                    src={lead.url}
                    alt={alt(0)}
                    width={lead.width}
                    height={lead.height}
                    sizes={SIZES_LEAD}
                    priority
                  />
                ) : null,
              )}
            </div>
          )}
          {rest.length > 0 && (
            <div className={styles.restCell}>
              {rest.map((image, index) => (
                <Image
                  key={image.pathname}
                  className={styles.image}
                  src={image.url}
                  alt={alt(index + 1)}
                  width={image.width}
                  height={image.height}
                  sizes={SIZES_FULL}
                />
              ))}
            </div>
          )}
        </div>
      </article>
      <ScrollToTop className={styles.scrollToTop} />
    </main>
  );
}

// Plain text; a blank line separates paragraphs (spaced from 1440 up), single breaks are kept.
function ProjectBody({ body }: { body: string }) {
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return (
    <div className={styles.body}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={styles.paragraph}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
