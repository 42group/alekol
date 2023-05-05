import { User } from '@alekol/shared/interfaces';
import { DashboardHeader } from '@alekol/shared/ui';
import { ironSessionWrapper } from '@alekol/shared/utils';
import { withIronSessionSsr } from 'iron-session/next';
import config from '../../lib/config';

export const getServerSideProps = withIronSessionSsr(
  ironSessionWrapper(config.baseUrl, [(_, { user }) => !!user.id]),
  config.ironSession
);

export interface DashboardProps {
  user?: User;
}

export function Dashboard({ user }: DashboardProps) {
  if (!user) return null;

  return (
    <>
      <DashboardHeader />
    </>
  );
}

export default Dashboard;
