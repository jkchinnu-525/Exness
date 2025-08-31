export interface leverageOrder {
  orderId: string;
  asset: string;
  userId: string;
  type: "buy" | "sell";
  openprice: number;
  quantity: number;
  security: number;
  leverage: number;
  exposure: number;
}

export interface simpleOrder {
  orderId: string;
  userId: string;
  asset: string;
  type: "buy" | "sell";
  openprice: number;
  quantity: number;
}
