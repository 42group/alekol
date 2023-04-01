import Link from 'next/link';
import styles from './button.module.scss';

export interface ButtonProps {
  children?: string;
  color?: 'primary' | 'secondary' | 'danger' | 'discord' | 'ft';
  disabled?: boolean;
  href?: string;
  size?: 'small' | 'large';
  width?: string;
}

export function Button({
  children = 'Button',
  color = 'primary',
  disabled = false,
  href,
  size = 'large',
  width = 'auto',
}: ButtonProps) {
  const globalProps = {
    className: `${styles.container} ${styles[color]} ${styles[size]} ${
      disabled ? styles.disabled : ''
    }`,
    style: { width },
  };
  if (href) {
    return (
      <Link href={href} {...globalProps}>
        {children}
      </Link>
    );
  }
  return <button {...globalProps}>{children}</button>;
}
