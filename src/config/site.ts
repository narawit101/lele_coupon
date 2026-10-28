const rawHandle = (
  process.env.NEXT_PUBLIC_SHOP_X_HANDLE || "lele0423_ticket"
)
  .replace(/^@/, "")
  .trim();

export const siteConfig = {
  shop: {
    xHandle: rawHandle,
    xUrl: `https://x.com/${rawHandle}`,
    xDisplay: `@${rawHandle}`,
  },
} as const;
