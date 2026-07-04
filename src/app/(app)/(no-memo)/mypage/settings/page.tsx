'use client';

import ChevronIcon from '@/assets/icons/common/chevron.svg';

import SettingItem from '../_components/Layout/SettingItem';
import { SETTINGS_ITEMS } from './_constants/settingsItems';

export default function SettingsPage() {
  return (
    <div>
      <div>
        {SETTINGS_ITEMS.map(({ options, key, ...settingItem }) => (
          <div key={key} className="border-b border-gray-300 p-3 last:border-b-0">
            <SettingItem
              {...settingItem}
              // TODO: (드롭다운 구현 시) 추후 선택된 옵션으로 buttonText 변경 필요
              buttonText={options[0]}
              buttonIcon={<ChevronIcon className="h-[10px] rotate-90" />}
              buttonIconPosition="right"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
