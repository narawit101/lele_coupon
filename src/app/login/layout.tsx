import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LELE' Ticket - เข้าสู่ระบบ",
  description: "เข้าสู่ระบบสมาชิก LELE' Ticket",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
