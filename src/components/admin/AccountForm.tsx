"use client";

import { useActionState } from "react";
import { changeAccount, type AccountState } from "@/app/admin/(protected)/account/actions";
import Button from "@/components/common/Button";
import { Field, TextInput } from "@/components/common/form/Field";
import styles from "./AccountForm.module.css";

const initialState: AccountState = { error: null, fieldErrors: {} };

export default function AccountForm({ currentUsername }: { currentUsername: string }) {
  const [state, formAction, pending] = useActionState(changeAccount, initialState);
  const errors = state.fieldErrors;

  return (
    <form className={styles.form} action={formAction}>
      <h1 className={styles.title}>계정 설정</h1>
      <p className={styles.description}>
        아이디나 비밀번호를 바꾸려면 현재 비밀번호를 입력하세요. 변경하면 모든 기기에서 로그아웃되고 다시 로그인해야 합니다.
      </p>

      <Field label="현재 비밀번호" error={errors.currentPassword}>
        <TextInput name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>

      <hr className={styles.divider} />

      <Field label="아이디" hint="영문 소문자, 숫자, . _ - 로 3~32자" error={errors.username}>
        <TextInput name="username" defaultValue={currentUsername} autoComplete="username" required />
      </Field>

      <Field label="새 비밀번호" hint="바꾸지 않으려면 비워 두세요. 10자 이상" error={errors.newPassword}>
        <TextInput name="newPassword" type="password" autoComplete="new-password" />
      </Field>

      <Field label="새 비밀번호 확인" error={errors.confirmPassword}>
        <TextInput name="confirmPassword" type="password" autoComplete="new-password" />
      </Field>

      {state.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "저장 중…" : "변경 저장"}
      </Button>
    </form>
  );
}
