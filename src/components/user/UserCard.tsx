"use client";

import { useRef, useState } from "react";
import { UserProfile } from "@/types/user";
import UserCardContent from "./UserCardContent";
import CardDetailModal from "./modals/CardDetailModal";

export interface UserCardProps {
  user: UserProfile;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenCardDetail?: (metrics: {
    top: number;
    left: number;
    width: number;
    height: number;
  }) => void;
}

export default function UserCard({
  user,
  onOpenCardDetail,
  onRefresh,
  isRefreshing = false,
}: UserCardProps) {
  const [showCardModal, setShowCardModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleOpenCard = () => {
    if (onOpenCardDetail && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      onOpenCardDetail({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setShowCardModal(true);
    }
  };

  return (
    <div className="space-y-2.5 sm:space-y-3 w-full outline-none">
      {/* 4:3 VIP Membership Card (Tap to Expand into Luxury Full-Screen View) */}
      <div
        ref={cardRef}
        onClick={handleOpenCard}
        className="relative w-full aspect-4/3 cursor-pointer select-none transition-transform active:scale-[0.99] outline-none focus:outline-none"
      >
        <UserCardContent
          user={user}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* Fallback internal modal if onOpenCardDetail is not provided */}
      {!onOpenCardDetail && (
        <CardDetailModal
          isOpen={showCardModal}
          onClose={() => setShowCardModal(false)}
          user={user}
        />
      )}
    </div>
  );
}
