import SettingItem from '../Layout/SettingItem';

import { getCompanyProfileItems } from './profile.data';

import type { CompanyProfile } from '@/types/profile';
import type { MypageModalItem } from '../Modal/types';

export type CompanyProfilesProps = {
  profile: CompanyProfile;
  onOpenModal: (item: MypageModalItem) => void;
};

export default function CompanyProfiles({ profile, onOpenModal }: CompanyProfilesProps) {
  const profileItems = getCompanyProfileItems(profile);

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
                  section: item.section,
                  field: item.field,
                  label: item.label,
                  value: item.value,
                  document: item.document,
                  buttonText: item.buttonText,
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
