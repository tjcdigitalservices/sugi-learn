import Link from "next/link";

interface ContinueLearningButtonProps {
  chapterId: string | null;
  label?: string;
  className?: string;
}

export function ContinueLearningButton({
  chapterId,
  label = "Continue Learning",
  className,
}: ContinueLearningButtonProps) {
  if (!chapterId) {
    return null;
  }

  return (
    <Link
      href={`/learn/chapters/${chapterId}`}
      className={className ?? "sl-btn-gold"}
    >
      {label}
    </Link>
  );
}
