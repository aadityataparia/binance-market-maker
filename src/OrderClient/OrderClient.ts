export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL'
}

export type LimitOrderInput = {
  symbol: string;
  side: OrderSide;
  limitPrice: number;
  quantity: number;
};
export type Order = {
  orderId: string | number;
};

export interface OrderClient {
  createLimitOrder(order: LimitOrderInput): Promise<Order>;
  cancelOrder(symbol: string, orderId: string | number): Promise<Order>;
}
