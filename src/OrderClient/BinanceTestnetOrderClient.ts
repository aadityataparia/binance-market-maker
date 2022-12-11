import { LimitOrderInput, Order, OrderClient } from './OrderClient';
import axios, { Method } from 'axios';
import qs from 'query-string';
import crypto, { sign } from 'node:crypto';
import { debug } from '../util/debug';

const BASE_URL = 'https://testnet.binance.vision';

export class BinanceTestnetOrderClient implements OrderClient {
  async createLimitOrder({ symbol, side, limitPrice, quantity }: LimitOrderInput): Promise<Order> {
    const data = await this.sendRequest('/api/v3/order', 'POST', {
      symbol,
      type: 'LIMIT',
      timeInForce: 'GTC',
      side,
      price: limitPrice,
      quantity,
      newOrderRespType: 'RESULT'
    });

    return {
      orderId: data.orderId
    };
  }

  async cancelOrder(symbol: string, orderId: string | number): Promise<Order> {
    const order = await this.sendRequest('/api/v3/order', 'GET', {
      symbol,
      orderId
    });
    if (order.status === 'FILLED' || order.status === 'CANCELED') return { orderId };

    const data = await this.sendRequest('/api/v3/order', 'DELETE', {
      symbol,
      orderId
    });

    return {
      orderId: data.orderId
    };
  }

  async getAllOrders(symbol: string) {
    return this.sendRequest('/api/v3/allOrders', 'GET', {
      symbol
    });
  }

  async cancelAllOpenOrders(symbol: string) {
    return this.sendRequest('/api/v3/openOrders', 'DELETE', {
      symbol
    });
  }

  async sendRequest(url: string, method: Method, params: Record<string, any>): Promise<any> {
    const { BINANCE_API_KEY, BINANCE_API_SECRET } = process.env;

    params.timestamp = Date.now();
    params.recvWindow = 60000;

    let query = qs.stringify(params);
    const headers = {
      'X-MBX-APIKEY': BINANCE_API_KEY
    };

    const signature = crypto.createHmac('sha256', BINANCE_API_SECRET).update(query).digest('hex');
    query += `&signature=${signature}`;

    let body = undefined;
    if (method.toLowerCase() === 'get' || method.toLowerCase() === 'delete') {
      url += '?' + query;
    } else {
      body = query;
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const r = await axios.request({
      url: `${BASE_URL}${url}`,
      method,
      data: body,
      headers
    });
    return r.data;
  }
}
