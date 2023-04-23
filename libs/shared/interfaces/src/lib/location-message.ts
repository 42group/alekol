export interface LocationMessage {
  identifier: string;
  message: {
    location: {
      begin_at: string;
      end_at: string | null;
      host: string;
      login: string;
    };
  };
}
