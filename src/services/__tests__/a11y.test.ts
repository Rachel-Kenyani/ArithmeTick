import { activateProps, answerAnnouncement, levelDoneAnnouncement } from "@/services/a11y";

describe("a11y", () => {
  it("praises a right answer and never says wrong", () => {
    expect(answerAnnouncement(true, 7)).toBe("Yes, 7!");
    expect(answerAnnouncement(false, 7)).not.toMatch(/wrong/i);
  });

  it("says how many stars a level earned", () => {
    expect(levelDoneAnnouncement(1)).toBe("Level done! You earned 1 star.");
    expect(levelDoneAnnouncement(3)).toBe("Level done! You earned 3 stars.");
    expect(levelDoneAnnouncement(0)).toBe("Level done! Well done.");
  });

  it("activates only on the activate action", () => {
    const onActivate = jest.fn();
    const props = activateProps(onActivate);
    props.onAccessibilityAction?.({ nativeEvent: { actionName: "increment" } } as never);
    props.onAccessibilityAction?.({ nativeEvent: { actionName: "activate" } } as never);
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(activateProps(undefined)).toEqual({});
  });
});
