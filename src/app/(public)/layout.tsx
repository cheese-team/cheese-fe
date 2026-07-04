import Image from 'next/image';
import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg-1 relative min-h-dvh">
      <header className="absolute top-20 left-25">
        <Link href="/" aria-label="Cheese 홈">
          <Image src="/brands/cheese-logo.svg" alt="CHEESE" width={125} height={34} priority />
        </Link>
      </header>

      <div className="flex min-h-dvh items-center justify-center py-40">{children}</div>
    </div>
  );
}
