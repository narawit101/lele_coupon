import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LELE' Ticket - #เลอเล่อรับกดบัตร",
  description: "ระบบจัดการหลังบ้าน LELE' Ticket",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
