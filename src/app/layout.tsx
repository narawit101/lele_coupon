import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { ToastContainer } from "react-toastify";

const notoSansThai = Noto_Sans_Thai({
  weight: ["400", "500", "600"],
  subsets: ["thai"],
  variable: "--font-thai",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LELE' Ticket - #เลอเล่อรับกดบัตร",
    template: "%s",
  },
  description:
    "ระบบบัตรสมาชิกดิจิทัลและสะสมแต้มกดบัตรคอนเสิร์ต LELE' Ticket #เลอเล่อรับกดบัตร",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAF8F2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} ${nunitoSans.variable} font-sans`}
    >
      <body className="min-h-screen bg-[#FAF8F2] text-[#25384C] antialiased selection:bg-[#D0DEF7]">
        <UserProvider>
          {children}
          <ToastContainer
            position="bottom-center"
            autoClose={3200}
            hideProgressBar
            closeOnClick
            pauseOnHover
            theme="light"
            toastClassName="toast-lele"
          />
        </UserProvider>
      </body>
    </html>
  );
}
