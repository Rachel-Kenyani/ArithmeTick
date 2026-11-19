import { accountActions, accountKey } from "@/state/actions/account";
import { DEFAULT_STATE, getSnapshot, parse, setState } from "@/state/core";
import { makeProfile } from "@/state/seed";

const amani = () => makeProfile({ name: "Amani", grade: 3, avatar: "bear" });
const bahati = () => makeProfile({ name: "Bahati", grade: 2, avatar: "cheetah" });

beforeEach(() => {
  setState(() => DEFAULT_STATE);
});

function signUp(identifier: string) {
  accountActions.beginSignup(identifier);
  accountActions.verifyCode("12345678");
}

describe("accountKey", () => {
  it("ignores case and spaces", () => {
    expect(accountKey("  Parent@Gmail.com ")).toBe("parent@gmail.com");
  });
});

describe("each account keeps its own children", () => {
  it("starts a new account with no children", () => {
    signUp("first@gmail.com");
    expect(getSnapshot().account?.identifier).toBe("first@gmail.com");
    expect(getSnapshot().profiles).toEqual([]);
  });

  it("does not show the previous account's children to a new Google account", () => {
    accountActions.login("first@gmail.com");
    setState((s) => ({ ...s, profiles: [amani()] }));
    accountActions.logout();

    accountActions.continueWithGoogle({ email: "second@gmail.com", name: "Second" });

    expect(getSnapshot().account?.method).toBe("google");
    expect(getSnapshot().profiles).toEqual([]);
  });

  it("brings back an account's children when it signs in again", () => {
    accountActions.login("first@gmail.com");
    const child = amani();
    setState((s) => ({ ...s, profiles: [child] }));
    accountActions.logout();
    accountActions.login("second@gmail.com");
    setState((s) => ({ ...s, profiles: [bahati()] }));

    accountActions.login("FIRST@gmail.com");

    expect(getSnapshot().profiles.map((p) => p.id)).toEqual([child.id]);
    expect(getSnapshot().families?.["second@gmail.com"]?.map((p) => p.name)).toEqual(["Bahati"]);
  });

  it("clears the chosen child when switching accounts", () => {
    accountActions.login("first@gmail.com");
    const child = amani();
    setState((s) => ({ ...s, profiles: [child], activeProfileId: child.id }));

    accountActions.login("second@gmail.com");

    expect(getSnapshot().activeProfileId).toBeNull();
  });

  it("keeps the family when the same account signs in again without logging out", () => {
    accountActions.login("first@gmail.com");
    setState((s) => ({ ...s, profiles: [amani()] }));

    accountActions.login("first@gmail.com");

    expect(getSnapshot().profiles).toHaveLength(1);
  });
});

describe("logout", () => {
  it("puts the children away and leaves nobody signed in", () => {
    accountActions.login("first@gmail.com");
    setState((s) => ({ ...s, profiles: [amani()] }));

    accountActions.logout();

    const s = getSnapshot();
    expect(s.account).toBeNull();
    expect(s.profiles).toEqual([]);
    expect(s.families?.["first@gmail.com"]).toHaveLength(1);
  });
});

describe("deleteAccount", () => {
  it("forgets the account and its children but keeps other families", () => {
    accountActions.login("other@gmail.com");
    setState((s) => ({ ...s, profiles: [bahati()] }));
    accountActions.logout();
    accountActions.login("first@gmail.com");
    setState((s) => ({ ...s, profiles: [amani()] }));

    accountActions.deleteAccount();

    const s = getSnapshot();
    expect(s.account).toBeNull();
    expect(s.profiles).toEqual([]);
    expect(s.families?.["first@gmail.com"]).toBeUndefined();
    expect(s.families?.["other@gmail.com"]).toHaveLength(1);
  });

  it("does nothing harmful when nobody is signed in", () => {
    accountActions.deleteAccount();
    expect(getSnapshot().account).toBeNull();
  });
});

describe("sign-up and reset codes", () => {
  it("only signs in after a sign-up code, not a reset code", () => {
    accountActions.beginReset("first@gmail.com");
    accountActions.verifyCode("12345678");
    expect(getSnapshot().account).toBeNull();
  });

  it("does not sign in someone who signed up with an existing account", () => {
    accountActions.beginSignup("first@gmail.com", true);
    expect(getSnapshot().pending?.purpose).toBe("existing");
    accountActions.verifyCode("12345678");
    expect(getSnapshot().account).toBeNull();
  });

  it("rejects a code with letters in it", () => {
    accountActions.beginSignup("first@gmail.com");
    expect(accountActions.verifyCode("12ab5678")).toBe(false);
  });
});

describe("loading saved state", () => {
  it("moves children left with nobody signed in out of sight", () => {
    const saved = JSON.stringify({ ...DEFAULT_STATE, account: null, profiles: [amani()] });
    const s = parse(saved);
    expect(s.profiles).toEqual([]);
    expect(s.families?.["signed-out"]).toHaveLength(1);
  });

  it("ignores saved state from another format", () => {
    expect(parse(JSON.stringify({ v: 99 }))).toBe(DEFAULT_STATE);
    expect(parse("not json")).toBe(DEFAULT_STATE);
  });
});

describe("changeEmail", () => {
  it("moves the account to the new email and keeps the children", () => {
    signUp("old@gmail.com");
    const child = amani();
    setState((s) => ({ ...s, profiles: [child], activeProfileId: child.id }));

    accountActions.changeEmail(" New@Gmail.com ");

    expect(getSnapshot().account?.identifier).toBe("new@gmail.com");
    expect(getSnapshot().profiles).toEqual([child]);
    expect(getSnapshot().activeProfileId).toBe(child.id);
  });

  it("keeps the children with the account after logging out and back in with the new email", () => {
    signUp("old@gmail.com");
    const child = amani();
    setState((s) => ({ ...s, profiles: [child] }));
    accountActions.changeEmail("new@gmail.com");
    accountActions.logout();

    accountActions.login("new@gmail.com");

    expect(getSnapshot().profiles).toEqual([child]);
  });

  it("does nothing when no one is signed in", () => {
    accountActions.changeEmail("new@gmail.com");
    expect(getSnapshot().account).toBeNull();
  });
});

describe("setReports", () => {
  it("remembers that reports are on for the signed-in account", () => {
    accountActions.login("first@gmail.com");
    accountActions.setReports(true);
    expect(getSnapshot().account?.reports).toBe(true);
    accountActions.setReports(false);
    expect(getSnapshot().account?.reports).toBe(false);
  });

  it("does nothing when nobody is signed in", () => {
    accountActions.setReports(true);
    expect(getSnapshot().account).toBeNull();
  });
});

describe("mergeSavedFamily", () => {
  it("brings the saved family onto a phone that has none", () => {
    accountActions.login("first@gmail.com");
    accountActions.mergeSavedFamily("first@gmail.com", [amani(), bahati()]);
    expect(getSnapshot().profiles.map((p) => p.name)).toEqual(["Amani", "Bahati"]);
  });

  it("ignores a family saved for an account that is no longer signed in", () => {
    accountActions.login("second@gmail.com");
    accountActions.mergeSavedFamily("first@gmail.com", [amani()]);
    expect(getSnapshot().profiles).toEqual([]);
  });

  it("matches the account whatever case the email was typed in", () => {
    accountActions.login("First@Gmail.com");
    accountActions.mergeSavedFamily("first@gmail.com", [amani()]);
    expect(getSnapshot().profiles).toHaveLength(1);
  });
});
