import { canChangeEmail, identifierProblem, newEmailProblem, maskIdentifier, normalizeIdentifier, normalizePhone, passwordProblem } from "@/features/auth/utils/validate";

describe("normalizePhone", () => {
  it.each(["0710515773", "+254710515773", "254710515773", "0710 515 773", "00254710515773", "0110515773"])(
    "reads %s as a Kenyan mobile number",
    (raw) => {
      expect(normalizePhone(raw)).toMatch(/^\+254[17]\d{8}$/);
    },
  );

  it("rejects numbers that aren't Kenyan mobiles", () => {
    expect(normalizePhone("0210515773")).toBeNull();
    expect(normalizePhone("07105")).toBeNull();
  });
});

describe("normalizeIdentifier", () => {
  it("lowercases emails", () => {
    expect(normalizeIdentifier(" Parent@Gmail.COM ")).toBe("parent@gmail.com");
  });

  it("formats phone numbers", () => {
    expect(normalizeIdentifier("0710 515 773")).toBe("+254710515773");
  });
});

describe("identifierProblem", () => {
  it("accepts an email or a phone number", () => {
    expect(identifierProblem("parent@gmail.com")).toBeNull();
    expect(identifierProblem("0710515773")).toBeNull();
  });

  it("explains what's wrong", () => {
    expect(identifierProblem("")).toMatch(/enter/i);
    expect(identifierProblem("parent@gmail")).toMatch(/email/i);
    expect(identifierProblem("0710")).toMatch(/Kenyan mobile/);
  });
});

describe("maskIdentifier", () => {
  it("hides most of an email or phone number", () => {
    expect(maskIdentifier("parent@gmail.com")).toBe("pa****@gmail.com");
    expect(maskIdentifier("+254710515773")).toBe("+254710****73");
  });
});

describe("passwordProblem", () => {
  it("needs at least 8 characters", () => {
    expect(passwordProblem("")).not.toBeNull();
    expect(passwordProblem("short")).toMatch(/8/);
    expect(passwordProblem("longenough")).toBeNull();
  });
});

describe("changing the email", () => {
  it("is only offered to email and password accounts", () => {
    expect(canChangeEmail({ identifier: "a@gmail.com", method: "password" })).toBe(true);
    expect(canChangeEmail({ identifier: "a@gmail.com", method: "google" })).toBe(false);
    expect(canChangeEmail({ identifier: "+254723456767", method: "password" })).toBe(false);
    expect(canChangeEmail(null)).toBe(false);
  });

  it.each([
    ["", /enter the new email/],
    ["not-an-email", /check the email/],
    [" OLD@gmail.com ", /email you use now/],
  ])("rejects %p", (raw, message) => {
    expect(newEmailProblem("old@gmail.com", raw)).toMatch(message);
  });

  it("accepts a different valid email", () => {
    expect(newEmailProblem("old@gmail.com", "new@gmail.com")).toBeNull();
  });
});
