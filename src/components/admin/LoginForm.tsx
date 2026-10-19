"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";
import Button from "@/components/common/Button";
import { Field, TextInput } from "@/components/common/form/Field";
import Logo from "@/components/common/Logo";
import styles from "./LoginForm.module.css";

const initialState: LoginState = { error: null };

export default function LoginForm({ next, notice }: { next: string; notice?: string | null }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form className={styles.form} action={formAction}>
      <div className={styles.heading}>
        <Logo variant="lockup" className={styles.logo} priority />
        <h1 className={styles.title}>Admin</h1>
      </div>
      <input type="hidden" name="next" value={next} />

      {notice && !state.error && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      <Field label="아이디">
        <TextInput name="username" autoComplete="username" required />
      </Field>

      <Field label="비밀번호" error={state.error}>
        <TextInput name="password" type="password" autoComplete="current-password" required />
      </Field>

      <Button type="submit" className={styles.submit} disabled={pending}>
        {pending ? "확인 중…" : "로그인"}
      </Button>
    </form>
  );
}
