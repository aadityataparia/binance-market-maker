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

## Run

```
yarn start
```
