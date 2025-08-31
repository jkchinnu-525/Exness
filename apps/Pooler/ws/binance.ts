import { createClient } from "redis";
import { w3cwebsocket as WebSocket } from "websocket";
import { priceToInteger } from "../utils/price";

const URL =
  "wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade/solusdt@trade";
const publisher = createClient({
  url: "redis://localhost:6379",
});

async function connect() {
  try {
    await publisher.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Redis connection failed:", err);
    return;
  }
  const ws = new WebSocket(URL);
  ws.onopen = () => {
    console.log("Connected to Binance");
  };

  ws.onmessage = (event: any) => {
    const data = event.data || event;
    const msg = JSON.parse(data.toString());
    if (msg?.data?.e === "trade") {
      const trade = msg.data;
      const symbol = trade.s;
      const priceInteger = priceToInteger(trade.p);
      const price = parseFloat(trade.p);
      const quantity = Number(trade.q);
      const timestamp = Number(trade.T);
      const priceSpreadPercentage = 2;
      const priceSpread = price * (priceSpreadPercentage / 100);
      const bid = price - priceSpread / 2;
      const ask = price + priceSpread / 2;

      const tradeData = {
        symbol,
        price: priceInteger, //Storing as integer
        bid: bid,
        ask: ask,
        quantity,
        timestamp,
      };
      console.log(tradeData);
      publisher.publish("trades", JSON.stringify(tradeData));
    } else {
      console.log("Unkown error ", msg);
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("Disconnected.Reconnecting in 3s...");
    setTimeout(connect, 3000);
  };
}

connect();
