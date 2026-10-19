import Link from "next/link";
import styles from "./NotFoundView.module.css";

// Minimal 404 body (no Figma design): one line and a way back to Home.
export default function NotFoundView() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>
      <Link className={styles.link} href="/">
        Home으로 돌아가기
      </Link>
    </main>
  );
}
