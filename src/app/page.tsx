"use client";

import React, { useEffect, useState } from "react";
import liff from "@/lib/liff";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { MANUAL_LOGOUT_KEY } from "@/lib/auth-session";
import { toast } from "react-toastify";
import { MessageSquarePlus } from "lucide-react";
import Navbar from "@/components/Navbar";
import ConfirmModal from "@/components/admin/modals/ConfirmModal";
import {
  UserCard,
  ActivityFeed,
  BottomNav,
  UserNavTab,
  SettingsView,
  useUserActivities,
  useUserPasses,
  useUserPromotions,
  ReviewModal,
  PassWalletModal,
  EditProfileModal,
  RewardExchangeModal,
  RedeemCodeModal,
} from "@/components/user";

export default function HomePage() {
  const router = useRouter();
  const { userData: user, token, isLoad, logout, refreshUserData } = useUser();

  const [activeTab, setActiveTab] = useState<UserNavTab>("HOME");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRedeemCodeModal, setShowRedeemCodeModal] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);

  // Domain Hooks
  const {
    activities,
    category,
    activityPage,
    activityTotalPages,
    activityTotal,
    activityLoading,
    activitySectionRef,
    fetchActivities,
    handleCategoryChange,
    handleActivityPageChange,
  } = useUserActivities({ token });

  const {
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
  } = useUserPasses({ token });

  const {
    promotions,
    promotionsLoading,
    showExchangeModal,
    setShowExchangeModal,
    loadPromotions,
    handleRedeem,
  } = useUserPromotions({
    token,
    user,
    refreshUserData,
    onRedeemSuccess: () => {
      fetchActivities(1);
      fetchUserPasses(1, passesStatus);
    },
  });

  // Pull-to-refresh or manual refresh handler
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshUserData(),
        fetchActivities(activityPage),
        fetchUserPasses(passesPage, passesStatus),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Logout handler
  const handleConfirmLogout = () => {
    try {
      if (liff.isLoggedIn()) liff.logout();
    } catch {
      // LIFF may not have been initialized
    }
    logout();
    sessionStorage.setItem(MANUAL_LOGOUT_KEY, "1");
    router.replace("/login");
  };

  // Auth protection guard
  useEffect(() => {
    if (!isLoad) return;
    if (!token || !user) {
      router.replace("/login");
    }
  }, [isLoad, token, user, router]);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  useEffect(() => {
    if (token && user?.id) {
      fetchActivities(activityPage);
      fetchUserPasses(passesPage, passesStatus);
    }
  }, [
    token,
    user?.id,
    activityPage,
    passesPage,
    passesStatus,
    fetchActivities,
    fetchUserPasses,
  ]);

  if (!isLoad || !user) {
    return (
      <div className="min-h-screen bg-[#FAF8F2] text-[#25384C] animate-pulse">
        <header className="sticky top-0 z-30 bg-[#FAF8F2]/95 backdrop-blur-md border-b border-[#D0DEF7]">
          <div className="w-full max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#D0DEF7]/60 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-24 bg-[#25384C]/15 rounded" />
                <div className="h-3 w-28 bg-[#5284B7]/20 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#D0DEF7]/50" />
            </div>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 pt-4 pb-20 space-y-4">
          <div className="rounded-[20px] p-5 border border-[#D0DEF7] bg-white h-48" />
          <div className="w-full h-11 bg-[#25384C]/15 rounded-xl" />
          <div className="rounded-2xl p-4 border border-[#D0DEF7] bg-white h-64" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F2] text-[#25384C]">
      {/* Top Header without dropdown */}
      <Navbar title="LELE' Ticket" subtitle="#เลอเล่อรับกดบัตร" />

      {/* Main Container */}
      <main className="max-w-lg mx-auto px-4 py-3 pb-24">
        {activeTab === "HOME" ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* User Card */}
            <UserCard
              user={user}
              isRefreshing={isRefreshing}
              onRefresh={handleRefresh}
              onExchangeReward={() => setShowExchangeModal(true)}
              onOpenPassWallet={handleOpenPassModal}
              onRedeemCode={() => setShowRedeemCodeModal(true)}
            />

            {/* Primary Action Button: Send Review */}
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="w-full min-h-11 px-4 bg-[#25384C] hover:bg-[#1B2938] text-white font-semibold rounded-xl shadow-lg shadow-[#25384C]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4 shrink-0" />
              <span>ส่งรีวิวขอรับแต้มสะสม</span>
            </button>

            {/* Categorized Activities Section */}
            <ActivityFeed
              activities={activities}
              activityLoading={activityLoading}
              isRefreshing={isRefreshing}
              activityTotal={activityTotal}
              activityPage={activityPage}
              activityTotalPages={activityTotalPages}
              selectedCategory={category}
              onCategoryChange={handleCategoryChange}
              onPageChange={handleActivityPageChange}
              containerRef={activitySectionRef}
              currentUser={user}
            />
          </div>
        ) : (
          <SettingsView
            user={user}
            onEditProfile={() => setShowProfileModal(true)}
            onRequestLogout={() => setShowLogoutConfirmModal(true)}
          />
        )}
      </main>

      {/* Bottom Navigation Dock */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirmModal}
        onClose={() => setShowLogoutConfirmModal(false)}
        title="ยืนยันการออกจากระบบ"
        message="คุณต้องการออกจากระบบบัญชีสมาชิกนี้ใช่หรือไม่?"
        confirmText="ออกจากระบบ"
        cancelText="ยกเลิก"
        isDestructive
        onConfirm={handleConfirmLogout}
      />

      {/* Direct Modals Rendering */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        userId={user.id}
        defaultXHandle={user.xHandle || ""}
        onSuccess={async () => {
          await refreshUserData();
          fetchActivities(1);
        }}
      />

      <PassWalletModal
        isOpen={showPassModal}
        onClose={() => setShowPassModal(false)}
        passes={userPasses}
        total={passesTotal}
        page={passesPage}
        totalPages={passesTotalPages}
        status={passesStatus}
        counts={passCounts}
        isLoading={passesLoading}
        onStatusChange={handlePassStatusChange}
        onPageChange={handlePassPageChange}
      />

      <EditProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        token={token}
        initialXHandle={user.xHandle}
        initialPhone={user.phone}
        currentAvatarUrl={user.avatarUrl}
        onSuccess={refreshUserData}
      />

      <RewardExchangeModal
        isOpen={showExchangeModal}
        onClose={() => setShowExchangeModal(false)}
        userStamps={user.stamps}
        promotions={promotions}
        isLoading={promotionsLoading}
        onRedeem={handleRedeem}
        onOpenMyPasses={handleOpenPassModal}
      />

      <RedeemCodeModal
        isOpen={showRedeemCodeModal}
        onClose={() => setShowRedeemCodeModal(false)}
        token={token}
        onSuccess={async () => {
          await refreshUserData();
          fetchActivities(1);
          fetchUserPasses(1, passesStatus);
        }}
        onOpenPasses={handleOpenPassModal}
      />
    </div>
  );
}
