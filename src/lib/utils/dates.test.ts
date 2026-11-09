import { describe, expect, it } from "vitest";
import { getCurrentWeekMondayAndFriday } from "@/src/lib/utils/dates";

describe("getCurrentWeekMondayAndFriday", () => {
  it("mengembalikan Senin dan Jumat minggu berjalan dalam format ISO", () => {
    const { monday, friday } = getCurrentWeekMondayAndFriday();
    expect(monday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(friday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(`${monday}T12:00:00`).getDay()).toBe(1);
    expect(new Date(`${friday}T12:00:00`).getDay()).toBe(5);
    expect(monday < friday).toBe(true);
  });
});
