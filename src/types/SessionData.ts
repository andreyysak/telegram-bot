export type SessionData = {
  registered?: boolean;

  trip?: {
    state: 'awaiting_kilometers' | 'awaiting_direction';
    km?: number;
    direction?: string;
  };

  maintenance?: {
    state: 'awaiting_description' | 'awaiting_cost';
    description?: string;
    cost?: number;
  };

  gas?: {
    state: 'awaiting_liters' | 'awaiting_total_price' | 'awaiting_gas_stattion';
    liters?: number;
    totalPrice?: number;
    gas_stattion?: string
  };

  wash?: {
    state: 'awaiting_description' | 'awaiting_cost';
    description?: string;
    cost?: number;
  };

  weather?: {
    state: 'weather_session'
  },

  ipinfo?: {
    state: 'awaiting_ip' | null
  },

  ping?: {
    state: 'ping_session' | null
  }
};
