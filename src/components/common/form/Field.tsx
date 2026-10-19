import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import styles from "./Field.module.css";

// Shared A2F form controls. Field wraps a control with its label, hint and error so the
// label stays associated (wrapping <label>) and errors are announced.

type FieldProps = {
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
};

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

const controlClass = (className?: string) => (className ? `${styles.control} ${className}` : styles.control);

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={controlClass(className)} {...rest} />;
}

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${controlClass(className)} ${styles.textarea}`} {...rest} />;
}

export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={controlClass(className)} {...rest} />;
}
