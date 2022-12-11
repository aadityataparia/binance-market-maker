import * as dotenv from 'dotenv';
dotenv.config();
/** Setup dotenv before importing any other file */

import { LiquidityProvider } from './LiquidityProvider';
import { BinanceTestnetOrderClient } from './OrderClient/BinanceTestnetOrderClient';
import { BinancePriceProvider } from './PriceProvider';

(async () => {
  const args = require('minimist')(process.argv.slice(2));
  const symbol = args.symbol || 'BTCUSDT';
  const priceGap = parseFloat(args.priceGap || '5');
  const quantity = parseFloat(args.quantity || '0.1');

  const priceProvider = new BinancePriceProvider(symbol);
  const orderClient = new BinanceTestnetOrderClient();

  await orderClient.cancelAllOpenOrders(symbol).catch(() => {});

  const liquidityProvider = new LiquidityProvider({
    symbol,
    priceGap,
    quantity,
    priceProvider,
    orderClient
  });

  await liquidityProvider.start();

  process.on('SIGINT', async () => {
    await liquidityProvider.stop();
  });
})();
