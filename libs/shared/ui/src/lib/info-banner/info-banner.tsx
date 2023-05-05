import styles from './info-banner.module.scss';

export interface InfoBannerProps {
  children?: string;
  color?: 'info' | 'warn' | 'error';
  title: string;
}

export function InfoBanner({
  children,
  color = 'info',
  title,
}: InfoBannerProps) {
  return (
    <div
      className={`${styles.container} ${styles[color]}`}
      data-testid="info-banner"
    >
      <h5>{title}</h5>
      <p>{children}</p>
    </div>
  );
}

export default InfoBanner;
