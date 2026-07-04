import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-[457px] items-center justify-center rounded-[25px] bg-white px-14 py-10">
      <div className="w-full">
        <div className="pb-10">
          <Image src="/brands/cheese-logo.svg" alt="CHEESE" width={125} height={34} priority />
        </div>
        {children}
      </div>
    </div>
  );
}
