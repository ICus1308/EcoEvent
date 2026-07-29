"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  className?: string;
}

export default function BackButton({ label = "Quay về Trang Chủ", className = "" }: BackButtonProps) {
  return (
    <Link href="/">
      <Button
        variant="ghost"
        size="sm"
        className={`text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs rounded-xl px-3 py-1.5 transition-colors cursor-pointer ${className}`}
      >
        <ArrowLeft className="h-4 w-4 mr-1.5 text-emerald-600" />
        <span>{label}</span>
      </Button>
    </Link>
  );
}
