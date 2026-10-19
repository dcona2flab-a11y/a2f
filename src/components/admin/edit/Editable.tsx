"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import EditPanel from "./EditPanel";
import styles from "./Editable.module.css";

// Wraps a region of the real (public) design in admin routes: hover/focus shows an outline
// and an edit chip; clicking it reveals `editor` right below the region, or in the right-side
// EditPanel when `panelTitle` is given (input that does not fit in place). The wrapped
// presentation component is unchanged — editing is added from the outside (CLAUDE.md §7C).

type EditableContextValue = { close: () => void };
const EditableContext = createContext<EditableContextValue | null>(null);

export function useEditable(): EditableContextValue {
  const context = useContext(EditableContext);
  if (!context) throw new Error("useEditable must be used inside <Editable>");
  return context;
}

type Props = {
  label: string;       // what is edited, e.g. "푸터 문구"
  editor: ReactNode;   // client editor element; closes itself via useEditable()
  panelTitle?: string; // open the editor in an EditPanel instead of in place
  children: ReactNode;
};

export default function Editable({ label, editor, panelTitle, children }: Props) {
  const [editing, setEditing] = useState(false);
  const context = { close: () => setEditing(false) };
  const inPanel = panelTitle !== undefined;
  const chipRef = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);

  // The in-place editor replaces the chip, so focus would be lost on close (저장 / 취소 / Esc):
  // give it back to the chip. (The EditPanel dialog restores focus by itself.)
  useEffect(() => {
    if (wasEditing.current && !editing && !inPanel) chipRef.current?.focus();
    wasEditing.current = editing;
  }, [editing, inPanel]);

  return (
    <div className={`${styles.region} ${editing ? styles.editing : ""}`}>
      {children}
      {!(editing && !inPanel) && (
        <button ref={chipRef} type="button" className={styles.chip} onClick={() => setEditing(true)} aria-label={`${label} 수정`}>
          수정
        </button>
      )}
      {inPanel ? (
        <EditPanel open={editing} title={panelTitle} onClose={context.close}>
          <EditableContext.Provider value={context}>{editor}</EditableContext.Provider>
        </EditPanel>
      ) : (
        editing && (
          <EditableContext.Provider value={context}>
            <div className={styles.editor}>{editor}</div>
          </EditableContext.Provider>
        )
      )}
    </div>
  );
}
