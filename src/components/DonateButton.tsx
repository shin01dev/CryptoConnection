// components/DonateButton.tsx

import { buttonVariants } from '@/components/ui/Button';
import Link from 'next/link';

type DonateButtonProps = {
  onClick: () => void;
  userId: string;
};

function DonateButton({ onClick, userId }: DonateButtonProps) {
  return (
    <div onClick={onClick} className="cursor-pointer">
      <Link href={`/r/myFeed/${userId}/donate`}>
        <p className={buttonVariants({ className: 'w-full mt-4 mb-6' })}>
          후원하기
        </p>
      </Link>
    </div>
  );
}

export default DonateButton;
