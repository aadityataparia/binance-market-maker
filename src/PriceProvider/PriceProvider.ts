type Listener = (price: number) => any;

export interface PriceProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  addListener(listener: Listener): void;
}

export class BasePriceProvider implements PriceProvider {
  symbol: string;
  listeners: Set<Listener>;
  connected: boolean = false;

  constructor(symbol: string) {
    this.symbol = symbol;
    this.listeners = new Set();
  }

  connect(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  disconnect(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  onChange(price: number) {
    this.listeners.forEach((l) => {
      l(price);
    });
  }

  addListener(listener: Listener): void {
    this.listeners.add(listener);
  }
}
