// Creates the first admin account in the private Blob store, or resets it.
//
//   npm run admin:bootstrap              first-time setup (refuses if an account exists)
//   npm run admin:bootstrap -- --reset   developer password reset (e.g. the operator forgot it)
//
// After setup, the admin changes the username/password at /admin/account.
// The password is read without echo, hashed here with the same code the server uses, and
// neither the password nor the hash is ever printed. A reset changes the session epoch, so
// existing sessions stop working (within about 10 minutes — see lib/auth/account-cache).
//
// Runs with tsx under the "react-server" condition so the server-only modules can be imported.

import { createInterface } from "node:readline/promises";
import { createSessionEpoch, readAdminAccount, saveAdminAccount } from "../src/lib/auth/account-store";
import { hashPassword } from "../src/lib/auth/password";
import { newPasswordSchema, usernameSchema } from "../src/lib/validation/auth";

const reset = process.argv.includes("--reset");

async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

// Reads a line without echoing it to the terminal.
function askHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;
    if (!stdin.isTTY) {
      reject(new Error("Run this in an interactive terminal (password input is hidden)."));
      return;
    }
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (char === "\u0003") process.exit(130); // Ctrl+C
        if (char === "\u007f") value = value.slice(0, -1); // Backspace
        else value += char;
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const existing = await readAdminAccount();
  if (existing && !reset) {
    console.error("관리자 계정이 이미 있습니다. 비밀번호를 재설정하려면: npm run admin:bootstrap -- --reset");
    process.exit(1);
  }
  if (!existing && reset) {
    console.error("재설정할 계정이 없습니다. --reset 없이 실행하세요.");
    process.exit(1);
  }

  console.log(reset ? "관리자 계정 재설정" : "관리자 계정 최초 생성");

  const username = usernameSchema.safeParse(await ask("아이디 (영문 소문자, 숫자, . _ - 로 3~32자): "));
  if (!username.success) throw new Error(username.error.issues[0].message);

  const password = await askHidden("비밀번호 (10자 이상, 입력 내용은 표시되지 않음): ");
  const checked = newPasswordSchema.safeParse(password);
  if (!checked.success) throw new Error(checked.error.issues[0].message);
  if ((await askHidden("비밀번호 확인: ")) !== password) throw new Error("비밀번호가 일치하지 않습니다.");

  const saved = await saveAdminAccount(existing?.version ?? 0, {
    username: username.data,
    passwordHash: await hashPassword(password),
    sessionEpoch: createSessionEpoch(),
  });
  if (!saved.ok) throw new Error("다른 변경과 충돌했습니다. 다시 실행하세요.");

  console.log(`완료: 관리자 아이디 "${username.data}" (버전 ${saved.document.version}).`);
  if (reset) console.log("기존 로그인 세션은 약 1분 안에 모두 만료됩니다.");
}

main().catch((error: unknown) => {
  console.error(`실패: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
