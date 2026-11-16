import Link from 'next/link';

// import ArrowIcon from '@/assets/icons/common/arrow.svg';

type DashboardPostListProps = {
  title: string;
  posts: {
    id: string;
    category: string;
    title: string;
    href: string;
  }[];
};

function DashboardPostListItem({ post }: { post: DashboardPostListProps['posts'][number] }) {
  return (
    <Link
      href={post.href}
      className="hover:bg-bg-2 flex items-center gap-4 border-b border-gray-300 py-1 text-[14px] leading-[32px] font-medium transition-colors"
    >
      <span className="w-12 shrink-0 text-center text-gray-600">{post.category}</span>

      <p className="min-w-0 flex-1 truncate">{post.title}</p>
    </Link>
  );
}

export default function DashboardPostList({ title, posts }: DashboardPostListProps) {
  return (
    <div className="min-w-0 flex-1 px-5 py-3">
      <h3 className="mb-3 ml-3 inline-flex items-center gap-3 leading-[20px] font-bold">
        {title}
        {/* TODO: 타이틀 클릭 시 페이지 이동 및 화살표 표시 여부 논의 후 스타일 정리 */}
        {/* <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center text-gray-500">
          <ArrowIcon className="h-[14px] w-[8px] rotate-180" />
        </span> */}
      </h3>

      <div className="border-t border-gray-300">
        {posts.map((post) => (
          <DashboardPostListItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
