export interface LocationMessage {
  identifier: string;
  message: {
    location: {
      id: number;
      begin_at: string;
      end_at: string | null;
      host: string;
      login: string;
    };
  };
}
