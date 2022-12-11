# binance-market-maker

Provide liquidity to binance testnet [https://testnet.binance.vision](https://testnet.binance.vision)

## Prerequisite

- Node v16.x
- [Yarn](https://yarnpkg.com/)

## Setup

1. Intall dependencies

```
yarn install
```

2. Add ENV variables

Copy `.sample.env` file to `.env`. 

Put Binance API key and secret generated after logging in at [https://testnet.binance.vision](https://testnet.binance.vision), follow steps after clicking `Generate HMAC_SHA256 Key`.

## Assumptions

- Account has liquidity in given symbol as well as cash to create and fill liquidity orders.

## Run

```
yarn start --symbol BTCUSDT --priceGap 10 --quantity 0.1
```

### Args

- `symbol`: Asset symbol to provide liquidity for, default: `BTCUSDT`
- `priceGap`: Liquidity Provider will create buy order at `currentPrice - priceGap` and sell order at `currentPrice + priceGap`, default: `5`
- `quantity`: Liquidity Order Amount, default: `0.1`

set `LOG=true` to see orders created and filled at.

set `DEBUG=true` to see current price changes and order details.
