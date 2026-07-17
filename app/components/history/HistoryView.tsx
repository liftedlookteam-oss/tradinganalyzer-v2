"use client";

import { useEffect, useState } from "react";
import DesktopHistory from "./DesktopHistory";
import MobileHistory from "./MobileHistory";
import type { HistoryItem } from "./types";

type HistoryViewProps = {
  filteredItems: HistoryItem[];
  totalAnalyses: number;
  loading: boolean;
  search: string;
  filter: string;
  deleteTarget: HistoryItem | null;
  deleting: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onDeleteRequest: (item: HistoryItem) => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
};

export default function HistoryView(props: HistoryViewProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1024);

    update();

    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  if (isMobile) {
    return <MobileHistory {...props} />;
  }

  return <DesktopHistory {...props} />;
}