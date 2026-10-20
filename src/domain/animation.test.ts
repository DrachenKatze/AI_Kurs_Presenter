import { animationCss } from "./animation";

test("animationCss runs every chosen animation at once with its own amount and speed", () => {
  const css = animationCss({ shake: { angle: 15, speed: 0.5 }, jump: { height: 16, speed: 2 }, pulse: { size: 20, speed: 1 } }) as Record<
    string,
    string
  >;
  expect(css.animation).toBe(
    "el-shake 0.5s ease-in-out infinite, el-jump 2s ease-in-out infinite, el-pulse 1s ease-in-out infinite",
  );
  expect(css["--shake"]).toBe("15deg");
  expect(css["--jump"]).toBe("9cqw"); // 16% of the height = 9% of the width
  expect(css["--pulse"]).toBe("0.2");

  expect(animationCss(undefined)).toBeUndefined();
  expect(animationCss({})).toBeUndefined();
});
