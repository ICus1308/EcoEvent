"use client";

import { usePathname } from "next/navigation";

export default function MainLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/verify-otp");

  return (
    <main className={`${isAuthPage ? "" : "pt-16"} flex-1 flex flex-col`}>
      {children}
    </main>
  );
}
