import styles from './separator.module.scss';

export interface SeparatorProps {
  width?: string;
}

function Separator({ width = '100%' }: SeparatorProps) {
  return <hr className={styles.separator} style={{ width }} />;
}

export default Separator;
