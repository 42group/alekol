import styles from './button.module.scss';

export interface ButtonProps {
  children?: string;
  color?: 'primary' | 'secondary' | 'discord' | 'ft';
  size?: 'small' | 'large';
  width?: string;
}

function Button({
  children = 'Button',
  color = 'primary',
  size = 'large',
  width = 'auto',
}: ButtonProps) {
  return (
    <button
      className={`${styles.container} ${styles[color]} ${styles[size]}`}
      style={{ width }}
    >
      {children}
    </button>
  );
}

export default Button;
