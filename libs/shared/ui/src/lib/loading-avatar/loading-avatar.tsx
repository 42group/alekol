import Image from 'next/image';
import { useSkeleton } from '../hooks';
import styles from './loading-avatar.module.scss';

export type LoadingAvatarProps =
  | {
      loading?: false;
      src: string;
    }
  | { loading: true; src?: string };

export function LoadingAvatar({ loading, src }: LoadingAvatarProps) {
  const skeleton = useSkeleton(
    loading ? null : (
      <Image
        alt="avatar"
        src={src}
        width="96"
        height="96"
        className={styles.avatar}
      />
    ),
    styles.container
  );

  return skeleton;
}

export default LoadingAvatar;
