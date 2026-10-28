import liff from "@line/liff";

export interface LiffUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

const LIFF_ID = process.env.NEXT_PUBLIC_LINE_LIFF_ID;

let initPromise: Promise<void> | null = null;

/**
 * Initializes LINE LIFF once as a singleton promise.
 * Cleans up OAuth code/state query parameters to avoid duplicate authorization code errors.
 */
export async function initLiff(): Promise<{
  isLoggedIn: boolean;
  profile: LiffUserProfile | null;
  error: string | null;
}> {
  if (typeof window === "undefined") {
    return { isLoggedIn: false, profile: null, error: null };
  }

  try {
    if (!LIFF_ID || LIFF_ID === "YOUR_LINE_LIFF_ID_HERE") {
      const localMock = localStorage.getItem("lele_mock_profile");
      if (localMock) {
        return { isLoggedIn: true, profile: JSON.parse(localMock), error: null };
      }
      return {
        isLoggedIn: false,
        profile: null,
        error: "กรุณาระบุ NEXT_PUBLIC_LINE_LIFF_ID ใน .env.local",
      };
    }

    if (!initPromise) {
      initPromise = (async () => {
        try {
          await liff.init({ liffId: LIFF_ID });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          // If authorization code was already consumed (e.g. StrictMode duplicate mount) and LIFF is logged in, treat as success
          if (message.includes("invalid authorization code") && liff.isLoggedIn()) {
            return;
          }
          throw err;
        } finally {
          // Clean up consumed OAuth query params from URL to prevent duplicate token exchange
          if (typeof window !== "undefined" && window.location.search) {
            const url = new URL(window.location.href);
            if (
              url.searchParams.has("code") ||
              url.searchParams.has("state") ||
              url.searchParams.has("liffClientId")
            ) {
              url.searchParams.delete("code");
              url.searchParams.delete("state");
              url.searchParams.delete("liffClientId");
              const cleanSearch = url.searchParams.toString();
              window.history.replaceState(
                {},
                document.title,
                url.pathname + (cleanSearch ? `?${cleanSearch}` : ""),
              );
            }
          }
        }
      })();
    }

    await initPromise;

    if (liff.isLoggedIn()) {
      const p = await liff.getProfile();
      return {
        isLoggedIn: true,
        profile: {
          userId: p.userId,
          displayName: p.displayName,
          pictureUrl: p.pictureUrl,
          statusMessage: p.statusMessage,
        },
        error: null,
      };
    } else {
      return { isLoggedIn: false, profile: null, error: null };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "LINE LIFF Error";
    return { isLoggedIn: false, profile: null, error: message };
  }
}

export function liffLogin() {
  if (typeof window === "undefined") return;
  if (LIFF_ID && LIFF_ID !== "YOUR_LINE_LIFF_ID_HERE") {
    liff.login();
  }
}

export function liffLogout() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("lele_user");
  localStorage.removeItem("lele_mock_profile");
  try {
    if (liff.isLoggedIn()) {
      liff.logout();
    }
  } catch {
    // Ignore if not initialized
  }
  window.location.replace("/login");
}

export default liff;
