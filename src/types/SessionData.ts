export type SessionData = {
  registered?: boolean;
  restricted?: boolean;

  trip?: {
    state: 'awaiting_kilometers' | 'awaiting_direction' | null;
    km?: number;
    direction?: string;
  };

  maintenance?: {
    state: 'awaiting_work_type' | 'awaiting_kilometers' | 'awaiting_cost';
    workType?: string;
    km?: number;
    cost?: number;
  };

  gas?: {
    state: 'awaiting_liters' | 'awaiting_total_price' | 'awaiting_gas_stattion';
    liters?: number;
    totalPrice?: number;
    gas_stattion?: string
  };

  wash?: {
    state: 'awaiting_price' | null
    price?: number;
  };

  statistic?: {
    state: 'await_statistic' | null;
  }

  expense_tracker?: {
    state: 'type' | 'category' | 'amount';
    type?: 'income' | 'expense';
    category?: string;
  }
};
