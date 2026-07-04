type PostDetailAsideProps = {
  profile: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export function PostDetailAside({ profile, children, actions }: PostDetailAsideProps) {
  return (
    <aside className="flex w-[300px] flex-col items-center rounded-[10px] border border-gray-400 p-5 text-[14px]">
      {profile}
      {children}
      {actions}
    </aside>
  );
}
