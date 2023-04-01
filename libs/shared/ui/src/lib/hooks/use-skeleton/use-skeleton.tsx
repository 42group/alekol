import React from 'react';
import Skeleton from '../../skeleton/skeleton';

export function useSkeleton(
  component: React.ReactElement | null,
  className: string
): React.ReactElement {
  if (component) return component;
  return (
    <div className={className}>
      <Skeleton />
    </div>
  );
}
