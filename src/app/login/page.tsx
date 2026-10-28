"use client";

import React, { useCallback, useEffect, useState } from "react";
import liff, { initLiff } from "@/lib/liff";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { MANUAL_LOGOUT_KEY, shouldAutoLogin } from "@/lib/auth-session";
import { UserLoginForm, GuideModal } from "@/components/user/auth";

export default function Login() {
  const router = useRouter();
  const { setUserData, setToken, token, isLoad, userData } = useUser();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("กำลังเตรียมระบบ...");
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API || "/api";

  const handleLogin = useCallback(async () => {
    sessionStorage.removeItem(MANUAL_LOGOUT_KEY);
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage("กำลังโหลดข้อมูล");

    try {
      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      let profile;
      try {
        profile = await liff.getProfile();
      } catch (profileErr) {
        console.error("getProfile error:", profileErr);
        setErrorMessage("ไม่สามารถดึงข้อมูล LINE ได้ กรุณาลองใหม่อีกครั้ง");
        setLoading(false);
        return;
      }

      if (!profile || !profile.userId) {
        setErrorMessage("ไม่พบข้อมูลบัญชี LINE กรุณาลองใหม่อีกครั้ง");
        setLoading(false);
        return;
      }

      setStatusMessage("กำลังเข้าสู่ระบบ");
      const res = await fetch(`${API_URL}/auth/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_id: profile.userId,
          name: profile.displayName,
          image: profile.pictureUrl || null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem("token", data.token);

        const resUser = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });

        if (resUser.ok) {
          const dataUser = await resUser.json();
          setUserData(dataUser.user);
          router.replace("/");
        } else {
          setErrorMessage("ไม่สามารถโหลดข้อมูลสมาชิกได้");
        }
      } else {
        setErrorMessage(data.message || "เข้าสู่ระบบไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  }, [API_URL, router, setToken, setUserData]);

  // Redirect to home if already authenticated
  useEffect(() => {
    if (!isLoad) return;
    if (token && userData) {
      router.replace("/");
    }
  }, [isLoad, token, userData, router]);

  // LIFF initialization & auto-login after redirect
  useEffect(() => {
    let isMounted = true;

    const runInit = async () => {
      const { isLoggedIn, error } = await initLiff();

      if (!isMounted) return;

      if (error && !error.includes("invalid authorization code")) {
        console.error("LIFF init error:", error);
      }

      if (
        shouldAutoLogin({
          isLiffLoggedIn: isLoggedIn || liff.isLoggedIn(),
          hasApplicationToken: Boolean(localStorage.getItem("token")),
          hasJustLoggedOut: sessionStorage.getItem(MANUAL_LOGOUT_KEY) === "1",
        })
      ) {
        handleLogin();
      }
    };

    runInit();

    return () => {
      isMounted = false;
    };
  }, [handleLogin]);

  return (
    <div className="min-h-screen w-full bg-[#FAF8F2] flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-md">
        <UserLoginForm
          loading={loading}
          statusMessage={statusMessage}
          errorMessage={errorMessage}
          onLogin={handleLogin}
          onOpenGuide={() => setShowGuideModal(true)}
        />
      </div>

      <GuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
}
