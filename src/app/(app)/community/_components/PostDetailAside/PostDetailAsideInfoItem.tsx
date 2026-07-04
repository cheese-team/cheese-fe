type PostDetailAsideInfoItemProps = {
  label: string;
  value: React.ReactNode;
};

export function PostDetailAsideInfoItem({ label, value }: PostDetailAsideInfoItemProps) {
  return (
    <div className="flex gap-8 leading-[24px]">
      <span className="w-[68px] text-gray-600">{label}</span>
      <span className="w-[136px] break-words">{value}</span>
    </div>
  );
}
