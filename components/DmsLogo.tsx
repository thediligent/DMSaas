import Image from 'next/image';
import { useTheme } from 'next-themes';

export function DmsLogo() {
  const { theme } = useTheme();

  return (
    <Image
      src="/dms-brand-white.svg"
      alt="DMS Logo"
      width={48}
      height={48}
      className={`size-6 ${theme === 'dark' ? 'invert-0' : 'invert'}`}
    />
  );
}
