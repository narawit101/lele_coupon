"use client";

import React, { useState } from "react";
import {
  UserCog,
  UserPlus,
  LogOut,
  ClipboardCheck,
  Gift,
  Ticket,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ProfileDropdown from "@/components/ProfileDropdown";
import {
  AdminTab,
  ConfirmModalConfig,
  AdminLoginForm,
  AdminForcePasswordForm,
  ReviewsTab,
  PromotionsTab,
  PassesTab,
  MembersTab,
  ProfileSettingsModal,
  ConfirmModal,
  useAdminAuth,
  useAdminReviews,
  useAdminPromotions,
  useAdminPasses,
  useAdminMembers,
} from "@/components/admin";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("REVIEWS");

  // 1. Auth & Admin Profile Hook
  const auth = useAdminAuth();

  // 2. Global Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<ConfirmModalConfig | null>(
    null,
  );
  const [confirmInputValue, setConfirmInputValue] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const openConfirmModal = (config: ConfirmModalConfig) => {
    setConfirmInputValue(config.defaultValue || "");
    setConfirmModal(config);
  };

  const closeConfirmModal = () => {
    if (!confirmLoading) {
      setConfirmModal(null);
    }
  };

  // Master refresh callback
  const handleRefreshAll = async () => {
    await Promise.all([
      reviewsHook.fetchReviews(),
      promotionsHook.fetchPromotions(),
      promotionsHook.fetchSpecialCodes(),
      passesHook.fetchPasses(),
      passesHook.fetchCodeRedemptions(),
      membersHook.fetchMembers(),
    ]);
  };

  // 3. Domain Hooks
  const reviewsHook = useAdminReviews({
    adminToken: auth.adminToken,
    onRefreshAll: handleRefreshAll,
  });

  const promotionsHook = useAdminPromotions({
    adminToken: auth.adminToken,
    onRefreshAll: handleRefreshAll,
  });

  const passesHook = useAdminPasses({
    adminToken: auth.adminToken,
    onRefreshAll: handleRefreshAll,
  });

  const membersHook = useAdminMembers({
    adminToken: auth.adminToken,
    adminProfile: auth.adminProfile,
    onProfileUpdate: auth.setAdminProfile,
    onRefreshAll: handleRefreshAll,
  });

  // Auth checking state
  if (auth.authChecking) {
    return (
      <main className="min-h-screen bg-[#FAF8F2] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-3 border-[#D0DEF7] border-t-[#25384C] animate-spin" />
          <p className="text-xs font-semibold text-[#25384C]">
            กำลังตรวจสอบสิทธิ์...
          </p>
        </div>
      </main>
    );
  }

  // Login Gate
  if (!auth.isAuthenticated) {
    return (
      <AdminLoginForm
        email={auth.email}
        setEmail={auth.setEmail}
        password={auth.password}
        setPassword={auth.setPassword}
        showPassword={auth.showLoginPassword}
        setShowPassword={auth.setShowLoginPassword}
        authError={auth.authError}
        loading={auth.loginLoading}
        onSubmit={auth.handleLoginSubmit}
      />
    );
  }

  // Force Password Change Gate
  if (auth.adminProfile?.mustChangePassword) {
    return (
      <AdminForcePasswordForm
        adminProfile={auth.adminProfile}
        newPassword={auth.newPassword}
        setNewPassword={auth.setNewPassword}
        confirmPassword={auth.confirmPassword}
        setConfirmPassword={auth.setConfirmPassword}
        showForcedNewPassword={auth.showForcedNewPassword}
        setShowForcedNewPassword={auth.setShowForcedNewPassword}
        showForcedConfirmPassword={auth.showForcedConfirmPassword}
        setShowForcedConfirmPassword={auth.setShowForcedConfirmPassword}
        passwordError={auth.passwordError}
        savingPassword={auth.savingPassword}
        onSubmit={auth.handleForceChangePassword}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F2] text-[#25384C] pb-16">
      {/* Top Navbar Component */}
      <Navbar
        title="LELE' Ticket"
        maxWidth="max-w-4xl"
        subtitle="#เลอเล่อรับกดบัตร"
        actions={
          <ProfileDropdown
            name={auth.adminProfile?.name || "Admin"}
            avatarUrl={auth.adminProfile?.avatarUrl}
            subtitle={auth.adminProfile?.email}
            badge={
              auth.adminProfile?.role === "DEV" ? (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#25384C] text-white shrink-0">
                  DEV
                </span>
              ) : undefined
            }
            title="เมนูผู้ดูแลระบบ"
            items={[
              {
                id: "profile-settings",
                label: "แก้ไขข้อมูล",
                icon: UserCog,
                onClick: auth.openProfileSettingsModal,
              },
              {
                id: "new-admin",
                label: "เพิ่มบัญชีแอดมินใหม่",
                icon: UserPlus,
                onClick: membersHook.openNewAdmin,
              },
              {
                id: "logout",
                label: "ออกจากระบบ",
                icon: LogOut,
                isDanger: true,
                dividerAbove: true,
                onClick: auth.handleLogout,
              },
            ]}
          />
        }
      />

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-12">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 border-b border-[#D0DEF7] pb-3 mb-4 text-xs font-bold">
          {(
            [
              {
                key: "REVIEWS",
                label: "ตรวจรีวิว",
                icon: ClipboardCheck,
              },
              {
                key: "PASSES",
                label: "ตรวจสอบคูปอง",
                icon: Ticket,
              },
              {
                key: "PROMOTIONS",
                label: "จัดการโปรโมชั่น",
                icon: Gift,
              },
              {
                key: "MEMBERS",
                label: "จัดการสมาชิก",
                icon: Users,
              },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
                  isActive
                    ? "bg-[#25384C] text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-[#FAF8F2] border border-[#D0DEF7]"
                }`}
              >
                <Icon
                  className={`w-3.75 h-3.75 shrink-0 ${
                    isActive ? "text-white" : "text-slate-500"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Reviews */}
        {activeTab === "REVIEWS" && (
          <ReviewsTab
            reviews={reviewsHook.reviews}
            reviewsTotal={reviewsHook.reviewsTotal}
            reviewsPage={reviewsHook.reviewsPage}
            reviewsTotalPages={reviewsHook.reviewsTotalPages}
            reviewsSearch={reviewsHook.reviewsSearch}
            reviewsStatus={reviewsHook.reviewsStatus}
            reviewsSortBy={reviewsHook.reviewsSortBy}
            reviewsSortOrder={reviewsHook.reviewsSortOrder}
            reviewsLoading={reviewsHook.reviewsLoading}
            inspectingReview={reviewsHook.inspectingReview}
            reviewActionLoading={reviewsHook.reviewActionLoading}
            onPageChange={reviewsHook.setReviewsPage}
            onSearchChange={reviewsHook.setReviewsSearch}
            onStatusChange={reviewsHook.setReviewsStatus}
            onSort={reviewsHook.handleSortReviews}
            onOpenDetail={reviewsHook.openReviewDetail}
            onCloseDetail={reviewsHook.closeReviewModal}
            onExecuteAction={reviewsHook.executeReviewAction}
            openConfirmModal={openConfirmModal}
          />
        )}

        {/* Tab 2: Promotions & Special Codes */}
        {activeTab === "PROMOTIONS" && (
          <PromotionsTab
            promotionsSubTab={promotionsHook.promotionsSubTab}
            onSubTabChange={(tab) => {
              promotionsHook.setPromotionsSubTab(tab);
              if (tab === "SPECIAL_CODES") promotionsHook.fetchSpecialCodes();
            }}
            promotions={promotionsHook.promotions}
            promotionsTotal={promotionsHook.promotionsTotal}
            promotionsPage={promotionsHook.promotionsPage}
            promotionsTotalPages={promotionsHook.promotionsTotalPages}
            promotionsSearch={promotionsHook.promotionsSearch}
            promotionsStatus={promotionsHook.promotionsStatus}
            promotionsSortBy={promotionsHook.promotionsSortBy}
            promotionsSortOrder={promotionsHook.promotionsSortOrder}
            promotionsLoading={promotionsHook.promotionsLoading}
            showPromoModal={promotionsHook.showPromoModal}
            editingPromo={promotionsHook.editingPromo}
            promoTitle={promotionsHook.promoTitle}
            setPromoTitle={promotionsHook.setPromoTitle}
            promoPoints={promotionsHook.promoPoints}
            setPromoPoints={promotionsHook.setPromoPoints}
            promoDesc={promotionsHook.promoDesc}
            setPromoDesc={promotionsHook.setPromoDesc}
            promoActive={promotionsHook.promoActive}
            setPromoActive={promotionsHook.setPromoActive}
            savingPromo={promotionsHook.savingPromo}
            onPageChange={promotionsHook.setPromotionsPage}
            onSearchChange={promotionsHook.setPromotionsSearch}
            onStatusChange={promotionsHook.setPromotionsStatus}
            onSort={promotionsHook.handleSortPromotions}
            onOpenCreate={promotionsHook.openCreatePromoModal}
            onOpenEdit={promotionsHook.openEditPromoModal}
            onCloseModal={promotionsHook.closePromoModal}
            onSavePromotion={promotionsHook.handleSavePromotion}
            onDeletePromotion={promotionsHook.executeDeletePromotion}
            specialCodes={promotionsHook.paginatedSpecialCodes}
            specialCodesTotal={promotionsHook.specialCodes.length}
            codesLoading={promotionsHook.codesLoading}
            codesSearch={promotionsHook.codesSearch}
            onCodesSearchChange={(search) => {
              promotionsHook.setCodesSearch(search);
              promotionsHook.setCodesPage(1);
              promotionsHook.fetchSpecialCodes(auth.adminToken, search);
            }}
            codesStatus={promotionsHook.codesStatus}
            onCodesStatusChange={(status) => {
              promotionsHook.setCodesStatus(status);
              promotionsHook.setCodesPage(1);
            }}
            codesPage={promotionsHook.codesPage}
            codesTotalPages={promotionsHook.codesTotalPages}
            onCodesPageChange={promotionsHook.setCodesPage}
            codesSortBy={promotionsHook.codesSortBy}
            codesSortOrder={promotionsHook.codesSortOrder}
            onCodesSort={promotionsHook.handleSortCodes}
            showCreateCodeModal={promotionsHook.showCreateCodeModal}
            editingCode={promotionsHook.editingCode}
            newCodeName={promotionsHook.newCodeName}
            onCodeNameChange={promotionsHook.setNewCodeName}
            newCodeRewardType={promotionsHook.newCodeRewardType}
            onRewardTypeChange={promotionsHook.setNewCodeRewardType}
            newCodePoints={promotionsHook.newCodePoints}
            onRewardPointsChange={promotionsHook.setNewCodePoints}
            newCodeTitle={promotionsHook.newCodeTitle}
            onRewardTitleChange={promotionsHook.setNewCodeTitle}
            newCodeMaxUses={promotionsHook.newCodeMaxUses}
            onMaxUsesChange={promotionsHook.setNewCodeMaxUses}
            newCodeExpiresAt={promotionsHook.newCodeExpiresAt}
            onExpiresAtChange={promotionsHook.setNewCodeExpiresAt}
            codeActive={promotionsHook.newCodeActive}
            setCodeActive={promotionsHook.setNewCodeActive}
            savingNewCode={promotionsHook.savingNewCode}
            onOpenCreateCode={promotionsHook.openCreateCodeModal}
            onOpenEditCode={promotionsHook.openEditCodeModal}
            onCloseCreateCode={promotionsHook.closeCreateCodeModal}
            onSaveNewCode={promotionsHook.handleSaveNewCode}
            onToggleCodeActive={promotionsHook.handleToggleCodeActive}
            onDeleteCode={promotionsHook.executeDeleteCode}
            openConfirmModal={openConfirmModal}
            currentTime={promotionsHook.currentTime}
          />
        )}

        {/* Tab 3: Passes & Code Redemptions */}
        {activeTab === "PASSES" && (
          <PassesTab
            passesSubTab={passesHook.passesSubTab}
            onSubTabChange={(tab) => {
              passesHook.setPassesSubTab(tab);
              if (tab === "REDEMPTION_LOGS") passesHook.fetchCodeRedemptions();
            }}
            passes={passesHook.passes}
            passesTotal={passesHook.passesTotal}
            passesPage={passesHook.passesPage}
            passesTotalPages={passesHook.passesTotalPages}
            passesSearch={passesHook.passesSearch}
            passesStatus={passesHook.passesStatus}
            passesSortBy={passesHook.passesSortBy}
            passesSortOrder={passesHook.passesSortOrder}
            passesLoading={passesHook.passesLoading}
            inspectingPass={passesHook.inspectingPass}
            passConcertInput={passesHook.passConcertInput}
            passActionLoading={passesHook.passActionLoading}
            onPageChange={passesHook.setPassesPage}
            onSearchChange={passesHook.setPassesSearch}
            onStatusChange={passesHook.setPassesStatus}
            onSort={passesHook.handleSortPasses}
            onOpenPassDetail={passesHook.openPassDetail}
            onClosePassModal={passesHook.closePassModal}
            onPassConcertInputChange={passesHook.setPassConcertInput}
            onExecutePassAction={passesHook.executePassAction}
            codeRedemptions={passesHook.paginatedRedemptions}
            codeRedemptionsTotal={passesHook.codeRedemptions.length}
            redemptionsLoading={passesHook.redemptionsLoading}
            redemptionsSearch={passesHook.redemptionsSearch}
            onRedemptionsSearchChange={(search) => {
              passesHook.setRedemptionsSearch(search);
              passesHook.setRedemptionsPage(1);
              passesHook.fetchCodeRedemptions(auth.adminToken, search);
            }}
            redemptionsFilter={passesHook.redemptionsFilter}
            onRedemptionsFilterChange={(filter) => {
              passesHook.setRedemptionsFilter(filter);
              passesHook.setRedemptionsPage(1);
            }}
            redemptionsPage={passesHook.redemptionsPage}
            redemptionsTotalPages={passesHook.redemptionsTotalPages}
            onRedemptionsPageChange={passesHook.setRedemptionsPage}
            redemptionsSortBy={passesHook.redemptionsSortBy}
            redemptionsSortOrder={passesHook.redemptionsSortOrder}
            onRedemptionsSort={passesHook.handleSortRedemptions}
            openConfirmModal={openConfirmModal}
          />
        )}

        {/* Tab 4: Members & Admins */}
        {activeTab === "MEMBERS" && (
          <MembersTab
            members={membersHook.members}
            membersTotal={membersHook.membersTotal}
            membersPage={membersHook.membersPage}
            membersTotalPages={membersHook.membersTotalPages}
            membersSearch={membersHook.membersSearch}
            membersSubTab={membersHook.membersSubTab}
            onSubTabChange={membersHook.setMembersSubTab}
            customersTotal={membersHook.customersTotal}
            adminsTotal={membersHook.adminsTotal}
            membersSortBy={membersHook.membersSortBy}
            membersSortOrder={membersHook.membersSortOrder}
            membersLoading={membersHook.membersLoading}
            adminProfile={auth.adminProfile}
            adjustModalUser={membersHook.adjustModalUser}
            adjustMode={membersHook.adjustMode}
            adjustAmount={membersHook.adjustAmount}
            adjustReason={membersHook.adjustReason}
            adjustSubmitting={membersHook.adjustSubmitting}
            showEditAdminModal={membersHook.showEditAdminModal}
            editingAdmin={membersHook.editingAdmin}
            editAdminName={membersHook.editAdminName}
            savingEditAdmin={membersHook.savingEditAdmin}
            showNewAdminModal={membersHook.showNewAdminModal}
            newAdminEmail={membersHook.newAdminEmail}
            newAdminName={membersHook.newAdminName}
            newAdminPasswordMode={membersHook.newAdminPasswordMode}
            newAdminPassword={membersHook.newAdminPassword}
            savingNewAdmin={membersHook.savingNewAdmin}
            onPageChange={membersHook.setMembersPage}
            onSearchChange={membersHook.setMembersSearch}
            onSort={membersHook.handleSortMembers}
            onOpenAdjust={membersHook.openAdjustModal}
            onCloseAdjust={membersHook.closeAdjustModal}
            onAdjustModeChange={membersHook.setAdjustMode}
            onAdjustAmountChange={membersHook.setAdjustAmount}
            onAdjustReasonChange={membersHook.setAdjustReason}
            onAdjustSubmit={membersHook.handleAdjustStamps}
            onOpenEditAdmin={membersHook.openEditAdmin}
            onCloseEditAdmin={membersHook.closeEditAdminModal}
            onEditAdminNameChange={membersHook.setEditAdminName}
            onSaveAdminName={membersHook.handleSaveAdminName}
            onDeleteAdmin={membersHook.executeDeleteAdmin}
            onOpenNewAdmin={membersHook.openNewAdmin}
            onCloseNewAdmin={membersHook.closeNewAdminModal}
            onNewAdminEmailChange={membersHook.setNewAdminEmail}
            onNewAdminNameChange={membersHook.setNewAdminName}
            onNewAdminPasswordModeChange={membersHook.setNewAdminPasswordMode}
            onNewAdminPasswordChange={membersHook.setNewAdminPassword}
            onCreateAdmin={membersHook.handleCreateAdmin}
            openConfirmModal={openConfirmModal}
          />
        )}
      </div>

      {/* Global Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={auth.showProfileSettingsModal}
        onClose={auth.closeProfileSettingsModal}
        adminProfile={auth.adminProfile}
        uploadingAvatar={auth.uploadingAvatar}
        onAvatarUpload={auth.handleAdminAvatarUpload}
        profileNameInput={auth.profileNameInput}
        setProfileNameInput={auth.setProfileNameInput}
        profileNewPassword={auth.profileNewPassword}
        setProfileNewPassword={auth.setProfileNewPassword}
        profileConfirmPassword={auth.profileConfirmPassword}
        setProfileConfirmPassword={auth.setProfileConfirmPassword}
        showProfileNewPassword={auth.showProfileNewPassword}
        setShowProfileNewPassword={auth.setShowProfileNewPassword}
        showProfileConfirmPassword={auth.showProfileConfirmPassword}
        setShowProfileConfirmPassword={auth.setShowProfileConfirmPassword}
        profilePasswordError={auth.profilePasswordError}
        setProfilePasswordError={auth.setProfilePasswordError}
        savingProfile={auth.savingProfile}
        onSave={async (e) => {
          await auth.handleSaveProfileSettings(e);
          membersHook.fetchMembers();
        }}
      />

      {/* Unified Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          isOpen={true}
          onClose={closeConfirmModal}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          isDestructive={confirmModal.isDestructive}
          isLoading={confirmLoading}
          inputLabel={confirmModal.inputLabel}
          inputPlaceholder={confirmModal.inputPlaceholder}
          inputValue={confirmInputValue}
          onInputChange={setConfirmInputValue}
          onConfirm={async () => {
            if (!confirmModal) return;
            setConfirmLoading(true);
            try {
              await confirmModal.onConfirm(confirmInputValue);
              setConfirmModal(null);
            } finally {
              setConfirmLoading(false);
            }
          }}
        />
      )}
    </div>
  );
}
