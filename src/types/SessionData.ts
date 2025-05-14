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
    state: 'awaiting_liters' | 'awaiting_price_per_liter' | 'awaiting_total_price';
    liters?: number;
    pricePerLiter?: number;
    totalPrice?: number;
  };

  wash?: {
    state: 'awaiting_description' | 'awaiting_cost';
    description?: string;
    cost?: number;
  };
};
