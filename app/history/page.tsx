"use client";

import { useEffect, useMemo, useState } from "react";
import HistoryView from "@/app/components/history/HistoryView";
import type { HistoryItem } from "@/app/components/history/types";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] =
    useState<HistoryItem | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  async function loadHistory() {
    try {
      const response = await fetch("/api/history");
      const data = await response.json();

      setItems(data.items || data.analyses || []);
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const response = await fetch("/api/history", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: deleteTarget.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error || "Failed to delete analysis.");
        return;
      }

      setItems((previousItems) =>
        previousItems.filter(
          (item) => item.id !== deleteTarget.id
        )
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete analysis", error);
      alert("Failed to delete analysis.");
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase().trim();

    return items.filter((item) => {
      const searchable = [
        item.market,
        item.instrument,
        item.trade_duration,
        item.analysis?.overallBias,
        item.analysis?.tradeQuality,
        item.analysis?.marketState,
        item.analysis?.mostImportantThing,
        item.analysis?.finalDecision,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchable.includes(query);

      const matchesFilter =
        filter === "All" ||
        item.analysis?.overallBias === filter;

      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  return (
    <HistoryView
      filteredItems={filteredItems}
      totalAnalyses={items.length}
      loading={loading}
      search={search}
      filter={filter}
      deleteTarget={deleteTarget}
      deleting={deleting}
      onSearchChange={setSearch}
      onFilterChange={setFilter}
      onDeleteRequest={setDeleteTarget}
      onDeleteCancel={() => setDeleteTarget(null)}
      onDeleteConfirm={confirmDelete}
    />
  );
}