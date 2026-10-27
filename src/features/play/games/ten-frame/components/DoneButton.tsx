/**
 * "Done" — the child decides when the frame shows the number, then checks. It sits where the
 * equation strip appears once the answer is right, so the board never shows a running count.
 */

import Button from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";

export function DoneButton({ count, onPress }: Readonly<{ count: number; onPress: () => void }>) {
  return (
    <Button
      size="md"
      variant="sun"
      fullWidth={false}
      style={{ alignSelf: "center" }}
      icon={<CheckIcon />}
      disabled={count === 0}
      onPress={onPress}
      accessibilityLabel="Done. Check my answer"
    >
      Done
    </Button>
  );
}
