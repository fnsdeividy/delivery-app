import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showBadge?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({
  className = "",
  showBadge = true,
  size = "md",
}: LogoProps) {
  const sizeClasses = {
    sm: "h-12 w-auto",
    md: "h-16 w-auto",
    lg: "h-20 w-auto",
  };

  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <Image
        src="/newlogo.png"
        alt="CARDAP.IO"
        width={0}
        height={0}
        sizes="100vw"
        className={`${sizeClasses[size]} object-contain`}
        priority
      />
    </Link>
  );
}
