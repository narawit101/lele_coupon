"use client";

import { useState, useCallback } from "react";
import { QueuePass } from "@/types/user";

interface UseUserPassesOptions {
  token: string | null;
}

export function useUserPasses({ token }: UseUserPassesOptions) {
  const [userPasses, setUserPasses] = useState<QueuePass[]>([]);
  const [passesPage, setPassesPage] = useState(1);
  const [passesTotalPages, setPassesTotalPages] = useState(1);
  const [passesTotal, setPassesTotal] = useState(0);
  const [passesStatus, setPassesStatus] = useState<"ALL" | "ACTIVE" | "USED">("ALL");
  const [passCounts, setPassCounts] = useState({ all: 0, active: 0, used: 0 });
  const [passesLoading, setPassesLoading] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  const fetchUserPasses = useCallback(
    async (page = passesPage, status = passesStatus) => {
      if (!token) return;
      setPassesLoading(true);
      try {
        const res = await fetch(`/api/users/passes?page=${page}&limit=5&status=${status}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUserPasses(data.passes || []);
          setPassesTotal(data.total || 0);
          setPassesTotalPages(data.totalPages || 1);
          setPassesPage(data.page || 1);
          if (data.counts) setPassCounts(data.counts);
        }
      } catch (err) {
        console.error("Failed to fetch passes:", err);
      } finally {
        setPassesLoading(false);
      }
    },
    [token, passesPage, passesStatus]
  );

  const handlePassPageChange = (newPage: number) => {
    setPassesPage(newPage);
    fetchUserPasses(newPage, passesStatus);
  };

  const handlePassStatusChange = (newStatus: "ALL" | "ACTIVE" | "USED") => {
    setPassesStatus(newStatus);
    setPassesPage(1);
    fetchUserPasses(1, newStatus);
  };

  const handleOpenPassModal = () => {
    setPassesStatus("ALL");
    setPassesPage(1);
    fetchUserPasses(1, "ALL");
    setShowPassModal(true);
  };

  return {
    userPasses,
    passesPage,
    passesTotalPages,
    passesTotal,
    passesStatus,
    passCounts,
    passesLoading,
    showPassModal,
    setShowPassModal,
    fetchUserPasses,
    handlePassPageChange,
    handlePassStatusChange,
    handleOpenPassModal,
  };
}
