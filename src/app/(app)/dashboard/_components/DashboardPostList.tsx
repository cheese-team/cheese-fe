import Link from 'next/link';

import ArrowIcon from '@/assets/icons/common/arrow.svg';

type DashboardPostListProps = {
  title: string;
  href: string;
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

export default function DashboardPostList({ title, href, posts }: DashboardPostListProps) {
  return (
    <div className="min-w-0 flex-1 px-5 py-3">
      <Link
        href={href}
        className="mb-3 ml-3 inline-flex items-center gap-3 leading-[20px] font-bold hover:underline"
      >
        {title}
        <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center text-gray-500">
          <ArrowIcon className="h-[14px] w-[8px] rotate-180" />
        </span>
      </Link>

      <div className="border-t border-gray-300">
        {posts.map((post) => (
          <DashboardPostListItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
