import { Circle, Ellipse, Path } from "react-native-svg";

import { ArtFrame, ink, type ArtProps } from "./art";

const FUR = "#8a5a33";
const FACE = "#f2c99a";

export default function MonkeyArt({ size = 64, title, tone = FUR }: Readonly<ArtProps & { tone?: string }>) {
  return (
    <ArtFrame size={size} title={title}>
      <Circle cx={12} cy={30} r={8} fill={tone} {...ink} />
      <Circle cx={52} cy={30} r={8} fill={tone} {...ink} />
      <Circle cx={12} cy={30} r={4} fill={FACE} />
      <Circle cx={52} cy={30} r={4} fill={FACE} />
      <Circle cx={32} cy={32} r={21} fill={tone} {...ink} />
      <Path d="M18 34 C18 22 27 20 32 26 C37 20 46 22 46 34 C46 46 40 52 32 52 C24 52 18 46 18 34 Z" fill={FACE} {...ink} />
      <Circle cx={26} cy={32} r={2.6} fill="#1b1b1b" />
      <Circle cx={38} cy={32} r={2.6} fill="#1b1b1b" />
      <Ellipse cx={32} cy={40} rx={2.4} ry={1.6} fill="#1b1b1b" />
      <Path d="M27 45 C30 48 34 48 37 45" fill="none" {...ink} />
    </ArtFrame>
  );
}
