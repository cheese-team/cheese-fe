import Image from 'next/image';

type ProfileImageProps = {
  src?: string | null;
  alt?: string;
  size?: number;
};

const DEFAULT_PROFILE_IMAGE = '/profile_default.png';

export default function ProfileImage({ src, alt = '프로필 이미지', size = 60 }: ProfileImageProps) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      <Image src={src || DEFAULT_PROFILE_IMAGE} alt={alt} fill className="object-cover" />
    </div>
  );
}
