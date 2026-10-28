export const BANGKOK_TZ = "Asia/Bangkok";

const thaiDateTimeFormatter = new Intl.DateTimeFormat("th-TH-u-ca-gregory", {
  timeZone: BANGKOK_TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatThaiDateTime(
  date: string | Date | null | undefined,
): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-";
    return `${thaiDateTimeFormatter.format(d)} น.`;
  } catch {
    return "-";
  }
}
