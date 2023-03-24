import styles from './separator.module.scss';

export interface SeparatorProps {
  width?: string;
}

export function Separator({ width = '100%' }: SeparatorProps) {
  return <hr className={styles.separator} style={{ width }} />;
}
