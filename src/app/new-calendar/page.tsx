// This page is deprecated - calendar creation is now handled via modal dialogs
// Redirect to home page
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewCalendar() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
