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
  submit: (identifier: string, password: string) => Promise<Partial<Errors> | null>;
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
