import Image from "next/image";
import clsx from "clsx";

export function Logo({
  className,
  invert = false,
  priority = false,
}: {
  className?: string;
  invert?: boolean;
  priority?: boolean;
}) {
  return (
    <span
      className={clsx("relative inline-block shrink-0", className)}
      aria-label="Arengcon"
    >
      <Image
        src="/logo.png"
        alt=""
        fill
        sizes="(max-width: 768px) 60vw, 800px"
        priority={priority}
        className={clsx("logo-asset object-contain", invert && "invert")}
      />
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "font-bank font-medium tracking-wider2 uppercase",
        className,
      )}
    >
      Arengcon
    </span>
  );
}
