import { signOutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  label?: string;
  className?: string;
}

export function SignOutButton({
  label = "Sign out",
  className,
}: SignOutButtonProps) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className={cn(
          "inline-flex items-center rounded-md border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
      >
        {label}
      </button>
    </form>
  );
}
