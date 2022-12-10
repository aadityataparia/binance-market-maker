import { BasePriceProvider } from './PriceProvider';
import SocketClient from '../SocketClient';

const BASE_URL = 'wss://data-stream.binance.com/stream';

export class BinancePriceProvider extends BasePriceProvider {
  ws: SocketClient;
  _id: number = 1;
  streamName: string;

  constructor(symbol: string) {
    super(symbol.toLowerCase());
    this.streamName = `${this.symbol}@aggTrade`;
    this.ws = new SocketClient(BASE_URL, {
      onmessage: this.onmessage.bind(this)
    });
  }

  get id() {
    return this._id++;
  }

  connect(): Promise<void> {
    return this.ws.send({
      method: 'SUBSCRIBE',
      params: [this.streamName],
      id: this.id
    });
  }

  async disconnect(): Promise<void> {
    const res = await this.ws.send({
      method: 'UNSUBSCRIBE',
      params: [this.streamName],
      id: this.id
    });
    this.ws.disconnect();
    return res;
  }

  onmessage(event: MessageEvent<string>) {
    const { stream, data } = JSON.parse(event.data);
    if (stream !== this.streamName || !data) return;

    const { s, p } = data;
    if (s.toLowerCase() === this.symbol) {
      this.onChange(parseFloat(p));
    }
  }
}
