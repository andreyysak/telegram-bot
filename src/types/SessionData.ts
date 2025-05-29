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

  weather?: {
    state: 'weather_session'
  },

  ipinfo?: {
    state: 'awaiting_ip' | null
  },

  ping?: {
    state: 'ping_session' | null
  },

  license_plate?: {
    state: 'awaiting_license_plate' | null
  },

  todo?: {
    state: 'add_todo' | 'list_todo' | 'delete_todo' | 'complete_todo' | 'edit_todo_index' | 'edit_todo_title' | 'export_todo_table' | null,
    title?: string,
    todoId?: number
  }
};
