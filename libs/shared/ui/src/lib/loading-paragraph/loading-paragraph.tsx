import { useSkeleton } from '../hooks/use-skeleton/use-skeleton';
import styles from './loading-paragraph.module.scss';

export type LoadingParagraphProps =
  | {
      loading?: false;
      children: string;
    }
  | { loading: true; children?: string };

export function LoadingParagraph({ children, loading }: LoadingParagraphProps) {
  const skeleton = useSkeleton(
    loading ? null : <p>{children}</p>,
    styles.container
  );

  return skeleton;
}

export default LoadingParagraph;
