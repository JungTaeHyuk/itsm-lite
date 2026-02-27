import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "ITSM Lite | IT Service Management",
  description: "현대적인 IT 서비스 관리 시스템",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
