import SettingItem from '../Layout/SettingItem';

import { getPersonalProfileItems } from './profile.data';

import type { PersonalProfile } from '@/types/profile';
import type { MypageModalItem } from '../Modal/types';

type PersonalProfilesProps = {
  profile: PersonalProfile;
  onOpenModal: (item: MypageModalItem) => void;
};

export default function PersonalProfiles({ profile, onOpenModal }: PersonalProfilesProps) {
  const profileItems = getPersonalProfileItems(profile);

  return (
    <div>
      <div>
        {profileItems.map((item) => (
          <div key={item.label} className="border-b border-gray-300 p-3 last:border-b-0">
            <SettingItem
              {...item}
              onClick={() => {
                if (!item.modalType) return;

                onOpenModal({
                  label: item.label,
                  buttonText: item.buttonText,
                  value: item.value,
                  document: item.document,
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
