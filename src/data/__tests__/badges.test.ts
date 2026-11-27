import { getBadge, newlyEarned, STAR_COLLECTOR_STARS, SUPER_STAR_STARS } from "@/data/badges";
import { makeProfile } from "@/state/seed";

const profile = () => makeProfile({ name: "Amani", grade: 1, avatar: "owl" });

describe("badges", () => {
  it("returns a badge by id and null for unknown ids", () => {
    expect(getBadge("ten-frame-explorer")?.name).toBe("Ten-Frame Explorer");
    expect(getBadge("unknown")).toBeNull();
  });

  it("does not return badges already earned", () => {
    const p = profile();
    p.progress[1] = 1;
    p.badges = ["ten-frame-explorer"];

    expect(newlyEarned(p)).not.toContain("ten-frame-explorer");
  });

  it("awards clean-play, stars, persistence, and high-five badges at thresholds", () => {
    const p = profile();
    p.progress = { 1: 3, 2: 0, 3: 0 };
    p.cleanSolves = { 1: 3 };
    p.stars = SUPER_STAR_STARS;
    p.highFives = 5;
    p.daysPlayed = ["2026-01-01", "2026-01-02", "2026-01-03"];

    const earned = newlyEarned(p);
    expect(earned).toEqual(expect.arrayContaining([
      "same-spotter",
      "first-try-1",
      "high-five-hero",
      "busy-bee",
      "star-collector",
      "super-star",
    ]));
  });

  it("tracks never-give-up for helped solves or replays", () => {
    expect(newlyEarned({ ...profile(), helpedSolves: 1 })).toContain("never-give-up");
    expect(newlyEarned({ ...profile(), replays: 1 })).toContain("never-give-up");
    expect(STAR_COLLECTOR_STARS).toBe(15);
  });
});
