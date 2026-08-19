"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { buttonPrimaryClassName } from "@/components/admin/chapter-management/form-primitives";
import { initializeAssessmentsAction } from "@/lib/assessment-management/actions";

interface InitializeAssessmentsButtonProps {
  className?: string;
}

export function InitializeAssessmentsButton({
  className,
}: InitializeAssessmentsButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await initializeAssessmentsAction();
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={className ?? buttonPrimaryClassName}
    >
      {isPending ? "Creating…" : "Initialize Pre/Post Assessments"}
    </button>
  );
}
