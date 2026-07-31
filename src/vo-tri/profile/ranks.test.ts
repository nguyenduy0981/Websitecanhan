import { describe, expect, it } from "vitest";
import { getRank } from "./ranks";

describe("getRank", () => {
  it("returns the base rank for level 0 and level 1", () => {
    expect(getRank(0)).toBe("Tân Binh");
    expect(getRank(1)).toBe("Tân Binh");
  });

  it("stays on the base rank right below the next threshold", () => {
    expect(getRank(4)).toBe("Tân Binh");
  });

  it("crosses into the next rank exactly at its threshold", () => {
    expect(getRank(5)).toBe("Kỳ Cựu");
    expect(getRank(9)).toBe("Kỳ Cựu");
    expect(getRank(10)).toBe("Cao Thủ");
    expect(getRank(19)).toBe("Cao Thủ");
    expect(getRank(20)).toBe("Huyền Thoại Vô Tri");
  });

  it("stays at the top rank for arbitrarily high levels", () => {
    expect(getRank(999)).toBe("Huyền Thoại Vô Tri");
  });
});
