import { LimitOrderInput, Order, OrderClient } from './OrderClient';
import axios, { Method } from 'axios';
import qs from 'query-string';
import crypto, { sign } from 'node:crypto';

const BASE_URL = 'https://testnet.binance.vision/api';
const API_KEY = process.env.BINANCE_API_KEY;
const API_SECRET = process.env.BINANCE_API_SECRET;

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
    console.log(data);

    return {
      orderId: data.orderId
    };
  }

  async cancelOrder(symbol: string, orderId: string | number): Promise<Order> {
    const data = await this.sendRequest('/api/v3/order', 'DELETE', {
      symbol,
      orderId
    });
    console.log(data);

    return {
      orderId: data.orderId
    };
  }

  async sendRequest(url: string, method: Method, params: Record<string, any>): Promise<any> {
    params.timestamp = Date.now();
    params.recvWindow = 60000;

    let query = qs.stringify(params);
    const headers = {
      'X-MBX-APIKEY': API_KEY
    };

    const signature = crypto.createHmac('sha256', API_SECRET).update(query).digest('hex');
    query += `&signature=${signature}`;

    let body = undefined;
    if (method.toLowerCase() === 'GET' || method.toLowerCase() === 'DELETE') {
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
