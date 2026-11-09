/** Senin & Jumat minggu berjalan dalam format ISO YYYY-MM-DD. */
export function getCurrentWeekMondayAndFriday(): { monday: string; friday: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() + diffToMonday);

  const fridayDate = new Date(mondayDate);
  fridayDate.setDate(mondayDate.getDate() + 4);

  const toIsoDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const dt = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${dt}`;
  };

  return {
    monday: toIsoDate(mondayDate),
    friday: toIsoDate(fridayDate),
  };
}
