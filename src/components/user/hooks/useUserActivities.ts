"use client";

import { useState, useRef, useCallback } from "react";
import { HomeActivity } from "../ActivityFeed";

interface UseUserActivitiesOptions {
  token: string | null;
}

export function useUserActivities({ token }: UseUserActivitiesOptions) {
  const [activities, setActivities] = useState<HomeActivity[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityLoading, setActivityLoading] = useState(false);
  const activitySectionRef = useRef<HTMLDivElement>(null);

  const fetchActivities = useCallback(
    async (page = 1) => {
      if (!token) return;
      setActivityLoading(true);
      try {
        const res = await fetch(`/api/users/activities?page=${page}&limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities || []);
          setActivityTotal(data.total || 0);
          setActivityTotalPages(data.totalPages || 1);
          setActivityPage(data.page || 1);
        }
      } catch (err) {
        console.error("Failed to fetch activities:", err);
      } finally {
        setActivityLoading(false);
      }
    },
    [token]
  );

  const handleActivityPageChange = (newPage: number) => {
    setActivityPage(newPage);
    fetchActivities(newPage);
    activitySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return {
    activities,
    activityPage,
    activityTotalPages,
    activityTotal,
    activityLoading,
    activitySectionRef,
    fetchActivities,
    handleActivityPageChange,
  };
}
