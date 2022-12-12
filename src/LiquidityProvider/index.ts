import { LimitOrderInput, Order, OrderClient, OrderSide } from '../OrderClient/OrderClient';
import { PriceProvider } from '../PriceProvider';
import { debug, log } from '../util/debug';

type OrderDetails = {
  orderId: string | number;
  price: number;
};

export class LiquidityProvider {
  symbol: string;
  priceProvider: PriceProvider;
  orderClient: OrderClient;
  priceGap: number;
  quantity: number;

  _buyOrder: OrderDetails | null = null;
  _sellOrder: OrderDetails | null = null;
  _inProgress: boolean = false;

  constructor({
    symbol,
    priceProvider,
    orderClient,
    priceGap,
    quantity
  }: {
    symbol: string;
    priceProvider: PriceProvider;
    orderClient: OrderClient;
    priceGap: number;
    quantity: number;
  }) {
    this.symbol = symbol;
    this.priceProvider = priceProvider;
    this.orderClient = orderClient;
    this.priceGap = priceGap;
    this.quantity = quantity;

    this.priceProvider.addListener(this.provide.bind(this));
  }

  start() {
    return this.priceProvider.connect();
  }

  async stop() {
    await this.cancelOrders();
    return this.priceProvider.disconnect();
  }

  async provide(price: number) {
    debug('Current Price: ', price);
    if (this._inProgress) return;
    this._inProgress = true;

    if (!this._buyOrder) {
      log('Creating initial orders');

      await this.placeOrders(price);
    } else if (price <= this._buyOrder.price || price >= this._sellOrder.price) {
      log('Previous order filled at', price, 'Creating new orders');

      await this.cancelOrders();
      await this.placeOrders(price);
    }

    this._inProgress = false;
  }

  async placeOrders(price: number) {
    const buyOrder: LimitOrderInput = {
      symbol: this.symbol,
      side: OrderSide.BUY,
      limitPrice: price - this.priceGap,
      quantity: this.quantity
    };
    const sellOrder: LimitOrderInput = {
      symbol: this.symbol,
      side: OrderSide.SELL,
      limitPrice: price + this.priceGap,
      quantity: this.quantity
    };

    let bO: Order, sO: Order;
    try {
      [bO, sO] = await Promise.all([
        this.orderClient.createLimitOrder(buyOrder),
        this.orderClient.createLimitOrder(sellOrder)
      ]);
    } catch (e) {
      console.error(
        'Error in creating orders, cancelling any order that were created. Will retry on next calculation.',
        e
      );
      if (bO) {
        await this.orderClient.cancelOrder(this.symbol, bO.orderId);
      }
      if (sO) {
        await this.orderClient.cancelOrder(this.symbol, sO.orderId);
      }
      return;
    }

    log('Created Buy Order at', buyOrder.limitPrice);
    debug(bO);
    log('Created Sell Order at', sellOrder.limitPrice);
    debug(sO);

    this._buyOrder = { orderId: bO.orderId, price: buyOrder.limitPrice };
    this._sellOrder = { orderId: sO.orderId, price: sellOrder.limitPrice };
  }

  async cancelOrders(retry: number = 3) {
    try {
      const cancelBuy = this._buyOrder
        ? this.orderClient.cancelOrder(this.symbol, this._buyOrder.orderId)
        : Promise.resolve();
      const cancelSell = this._sellOrder
        ? this.orderClient.cancelOrder(this.symbol, this._sellOrder.orderId)
        : Promise.resolve();

      await Promise.all([cancelBuy, cancelSell]);
    } catch (e) {
      console.error('Failed to cancel orders', e);
      if (retry >= 1) {
        log('Retrying cancelling orders');
        await this.cancelOrders(retry - 1);
      } else {
        throw e;
      }
    }

    this._buyOrder = null;
    this._sellOrder = null;

    log('Cancelled Previous Orders');
  }
}
