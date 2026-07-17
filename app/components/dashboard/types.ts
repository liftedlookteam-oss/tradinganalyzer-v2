export type Trade = {
  id: string;
  asset: string;
  result: "win" | "loss" | "breakeven";
  amount: number;
  notes?: string | null;
  trade_date: string;
};

export type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
};