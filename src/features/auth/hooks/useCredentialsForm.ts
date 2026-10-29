/**
 * Shared Log In / Sign Up form state: identifier + password, reward-early validation, submit and Google.
 * The password is only checked for shape here, handed to services/auth, and never stored or logged.
 */

import { useRef, useState } from "react";
import type { TextInputInstance } from "react-native";

import { identifierProblem, normalizeIdentifier, passwordProblem } from "@/utils/validate";

interface Errors {
  identifier: string | null;
  password: string | null;
}

const NO_ERRORS: Errors = { identifier: null, password: null };

export function useCredentialsForm({
  submit,
  google,
}: Readonly<{
  /** Runs once both fields pass. Resolve with field notes to show (e.g. a wrong password), or nothing on success. */
  submit: (identifier: string, password: string) => Promise<Partial<Errors> | null>;
  /** Resolves with a message to show (e.g. no Google Play services), or null. */
  google: () => Promise<string | null>;
}>) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>(NO_ERRORS);
  const [busy, setBusy] = useState<"form" | "google" | null>(null);
  const identifierRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);

  const onIdentifierChange = (next: string) => {
    setIdentifier(next);
    // Reward early: clear the note as soon as it's fixed (new notes only appear on submit).
    if (errors.identifier && !identifierProblem(next)) setErrors((prev) => ({ ...prev, identifier: null }));
  };

  const onPasswordChange = (next: string) => {
    setPassword(next);
    if (errors.password && !passwordProblem(next)) setErrors((prev) => ({ ...prev, password: null }));
  };

  const onSubmit = () => {
    if (busy) return;
    const next: Errors = { identifier: identifierProblem(identifier), password: passwordProblem(password) };
    setErrors(next);
    if (next.identifier) return identifierRef.current?.focus();
    if (next.password) return passwordRef.current?.focus();
    setBusy("form");
    void submit(normalizeIdentifier(identifier), password).then((problems) => {
      if (!problems) return;
      setErrors({ ...NO_ERRORS, ...problems });
      setBusy(null);
    });
  };

  const onGoogle = () => {
    if (busy) return;
    setBusy("google");
    void google().then((message) => {
      setBusy(null);
      if (message) setErrors({ ...NO_ERRORS, identifier: message });
    });
  };

  return {
    identifier, password, errors, busy, identifierRef, passwordRef,
    onIdentifierChange, onPasswordChange, onSubmit, onGoogle,
  };
}
