export type DailyInputRecapTabId =
  | "eggs"
  | "feed"
  | "population"
  | "medical";

export const DAILY_INPUT_RECAP_TABS: {
  id: DailyInputRecapTabId;
  label: string;
  description: string;
}[] = [
  {
    id: "eggs",
    label: "Produksi telur",
    description: "Entri TB / TR / TP per sesi input",
  },
  {
    id: "feed",
    label: "Konsumsi pakan",
    description: "Diets dan consumption per kandang",
  },
  {
    id: "population",
    label: "Mutasi populasi",
    description: "Increase dan decrease layer",
  },
  {
    id: "medical",
    label: "Pengobatan",
    description: "Laporan kesehatan dan pengobatan",
  },
];

export function parseDailyInputRecapTab(
  value: string | undefined,
): DailyInputRecapTabId {
  if (
    value === "feed" ||
    value === "population" ||
    value === "medical"
  ) {
    return value;
  }
  return "eggs";
}
