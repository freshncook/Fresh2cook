import type { Metadata } from "next";
import "./globals.css";
import UserChrome from "@/components/user-chrome";

export const metadata: Metadata = {
  title: "Fresh2Cook",
  description:
    "Fresh vegetables, fruits and ready-to-cook products delivered to your doorstep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <UserChrome>{children}</UserChrome>
      </body>
    </html>
  );
}




