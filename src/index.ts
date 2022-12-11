import * as dotenv from 'dotenv';
import { LiquidityProvider } from './LiquidityProvider';
dotenv.config();
/** Setup dotenv before importing any other file */

import { BinanceTestnetOrderClient } from './OrderClient/BinanceTestnetOrderClient';
import { OrderSide } from './OrderClient/OrderClient';

import { BinancePriceProvider } from './PriceProvider';

(async () => {
  const args = require('minimist')(process.argv.slice(2));
  const symbol = args.symbol || 'BTCUSDT';
  const priceGap = parseFloat(args.priceGap || '5');
  const quantity = parseFloat(args.quantity || '0.1');

  const priceProvider = new BinancePriceProvider(symbol);
  const orderClient = new BinanceTestnetOrderClient();

  await orderClient.cancelAllOpenOrders(symbol);

  const liquidityProvider = new LiquidityProvider({
    symbol,
    priceGap,
    quantity,
    priceProvider,
    orderClient
  });

  await liquidityProvider.start();
})();
