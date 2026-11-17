import { initialOf } from "@/features/profiles/utils/initialOf";


describe("initialOf", () => {
  it("uses the first letter of a name or email", () => {
    expect(initialOf("wanjiru kamau")).toBe("W");
    expect(initialOf("amani@gmail.com")).toBe("A");
  });

  it("skips digits and symbols before the first letter", () => {
    expect(initialOf("2kids.mum@gmail.com")).toBe("K");
  });

  it("has no letter for a phone number", () => {
    expect(initialOf("+254723456767")).toBeNull();
  });
});
