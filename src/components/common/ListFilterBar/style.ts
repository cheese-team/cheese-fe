export const listFilterBarClassNames = {
  form: 'flex w-full items-center gap-[10px]',

  sortRoot: 'relative shrink-0',

  sortButton:
    'flex h-[44px] w-[66px] items-center justify-center gap-[10px] rounded-[10px] border border-gray-400 bg-bg-white text-gray-500 outline-none hover:!border-gray-400 hover:!bg-bg-white hover:!text-gray-500 focus:!border-gray-400 focus:!bg-bg-white focus:!text-gray-500 active:!border-gray-400 active:!bg-bg-white active:!text-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-text-muted',

  sortChevronIcon: 'block h-[10px] w-[10px] shrink-0 rotate-90 [&_*]:fill-current',

  sortMenu:
    'absolute left-0 top-[calc(100%+8px)] z-50 flex w-[200px] flex-col gap-[10px] rounded-[10px] border border-gray-300 bg-bg-white p-[12px] shadow-[0_4px_20px_rgb(var(--color-gray-500-rgb)/0.25)]',

  sortMenuItem:
    'flex h-[20px] w-full items-center rounded-[10px] px-[8px] text-left text-[14px] font-medium leading-5 text-text outline-none focus:!bg-transparent active:!bg-transparent disabled:cursor-not-allowed disabled:text-text-muted',

  sortMenuItemActive: 'bg-gray-200',

  sortMenuItemInactive: 'bg-transparent',

  searchRoot: 'relative flex h-[44px] w-[500px] max-w-full items-center',

  searchIcon:
    'pointer-events-none absolute left-[12px] flex h-[20px] w-[20px] items-center justify-center text-gray-500',

  searchInput:
    'h-full w-full rounded-[10px] border border-gray-400 bg-bg-white px-[12px] pl-[44px] pr-[64px] font-sans text-[14px] font-medium leading-[20px] text-text outline-none placeholder:font-medium placeholder:text-gray-500 focus:!border-gray-400 focus:!ring-0',

  searchRightControls: 'absolute right-[12px] flex items-center justify-center gap-[12px]',

  searchClearButton:
    'flex h-5 w-5 items-center justify-center rounded-[10px] text-gray-400 hover:!text-gray-400 focus:!text-gray-400 active:!text-gray-400',

  searchClearIcon: 'block h-[12px] w-[12px] shrink-0 [&_*]:fill-current',

  searchHistoryToggleButton:
    'flex h-5 w-5 items-center justify-center rounded-[10px] text-gray-500 hover:!text-gray-500 focus:!text-gray-500 active:!text-gray-500',

  searchHistoryChevronIcon: 'block h-[10px] w-[10px] shrink-0 rotate-90 [&_*]:fill-current',

  searchHistoryMenu:
    'absolute left-0 top-[calc(100%+8px)] z-50 flex w-full flex-col rounded-[10px] border border-gray-300 bg-bg-white py-2 shadow-[0_4px_20px_rgb(var(--color-gray-500-rgb)/0.25)]',

  searchHistoryItem:
    'flex h-[40px] w-full items-center rounded-[10px] px-[14px] text-left text-[14px] font-medium leading-[20px] text-text hover:!bg-transparent focus:!bg-transparent active:!bg-transparent',

  actionButton:
    'inline-flex !items-center !justify-center !gap-0 rounded-[10px] border border-secondary-600 bg-secondary-600 !p-0 font-sans text-gray-50 hover:!border-secondary-600 hover:!bg-secondary-600 hover:!text-gray-50 active:!border-secondary-600 active:!bg-secondary-600 active:!text-gray-50 focus:!border-secondary-600 focus:!bg-secondary-600 focus:!text-gray-50 focus-visible:!outline-none disabled:cursor-not-allowed disabled:opacity-50',

  actionButtonContent: 'inline-flex h-[24px] items-center justify-center gap-[4px]',

  actionButtonIconWrapper:
    'flex h-[24px] w-[24px] shrink-0 items-center justify-center text-gray-50',

  actionButtonIcon: 'block h-[17px] w-[16px] shrink-0 [&_*]:fill-current',

  actionButtonLabel:
    'inline-flex h-[24px] items-center font-sans text-[14px] font-medium leading-[24px] text-gray-50',
};
