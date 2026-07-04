import SettingItem from '../Layout/SettingItem';

import { getAccountItems } from './profile.data';

import type { AccountSettings } from '@/types/profile';
import type { MypageModalItem } from '..//Modal/types';

type AccountSettingsProps = {
  profile: AccountSettings;
  onOpenModal: (item: MypageModalItem) => void;
};

export default function AccountSettings({ profile, onOpenModal }: AccountSettingsProps) {
  const accountItems = getAccountItems(profile);

  return (
    <div>
      <h2 className="mt-8 text-[20px] font-medium text-gray-700">계정 설정</h2>

      <div className="mt-5">
        {accountItems.map((item) => (
          <div key={item.label} className="border-b border-gray-300 p-3 last:border-b-0">
            <SettingItem
              {...item}
              buttonClassName={item.danger ? '!text-error-subtle' : ''}
              onClick={() => {
                if (!item.modalType) return;

                onOpenModal({
                  label: item.label,
                  buttonText: item.buttonText,
                  value: item.value,
                  options: item.options,
                  modalType: item.modalType,
                });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
