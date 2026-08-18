import type { CategoryTabsSize } from './type';

// TODO: style.ts 파일 사용 확인

export const categoryTabsClassNames = {
  list: 'flex flex-wrap items-center gap-[10px]',

  buttonBase:
    'inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-[10px] bg-bg-white outline-none disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-text-muted',

  buttonSize: {
    sm: 'h-[44px] px-[18px] text-[14px] leading-[24px]',
    md: 'h-[54px] px-[28px] text-[16px] leading-[24px]',
  } satisfies Record<CategoryTabsSize, string>,

  active:
    'border-2 border-secondary-600 text-secondary-800 font-bold hover:!border-secondary-600 hover:!text-secondary-800 hover:!bg-bg-white focus:!border-secondary-600 focus:!text-secondary-800 focus:!bg-bg-white active:!border-secondary-600 active:!text-secondary-800 active:!bg-bg-white',

  inactive:
    'border border-gray-400 text-gray-700 font-medium hover:!border-gray-400 hover:!text-gray-700 hover:!bg-bg-white focus:!border-gray-400 focus:!text-gray-700 focus:!bg-bg-white active:!border-gray-400 active:!text-gray-700 active:!bg-bg-white',
};
