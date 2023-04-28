export interface FtLocation {
  id: number;
  begin_at: string;
  end_at: string | null;
  host: string;
  user: {
    login: string;
  };
}
