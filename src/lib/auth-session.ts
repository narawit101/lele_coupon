export const MANUAL_LOGOUT_KEY = "just_logged_out";

export function shouldAutoLogin({
  isLiffLoggedIn,
  hasApplicationToken,
  hasJustLoggedOut,
}: {
  isLiffLoggedIn: boolean;
  hasApplicationToken: boolean;
  hasJustLoggedOut: boolean;
}) {
  return isLiffLoggedIn && !hasApplicationToken && !hasJustLoggedOut;
}
