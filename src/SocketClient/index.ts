import WebSocket from 'ws';

type JSONValue = string | number | JSONObject;

interface JSONObject {
  id?: number;
  [x: string]: JSONValue | JSONValue[];
}

class SocketClient {
  _requests = {};

  url: string;
  ws: WebSocket;
  protocol?: string;
  onmessage?: (event: MessageEvent<any>) => void;

  constructor(
    url: string,
    {
      protocol,
      onmessage
    }: {
      protocol?: string;
      onmessage?: (event: MessageEvent<any>) => void;
    } = {}
  ) {
    this.url = url;
    this.protocol = protocol;
    this.onmessage = onmessage;
  }

  connect() {
    return this._openSocket();
  }

  disconnect() {
    this.ws?.close();
  }

  send(message: JSONValue) {
    const id = typeof message === 'object' ? message?.id : null;

    return this._openSocket().then((ws: { send: (arg0: any) => void }) => {
      ws.send(JSON.stringify(message));
      return new Promise((res) => {
        if (id) {
          this._requests[id] = (v: unknown) => {
            delete this._requests[id];
            res(v);
          };
        }
      });
    });
  }

  _openSocket() {
    if (!this.ws) {
      this.ws = new WebSocket(this.url, this.protocol);
      this.ws.onmessage = this._onmessage.bind(this);
      this.ws.onerror = this.onerror;
    } else if (this.ws.readyState === this.ws.OPEN) {
      return Promise.resolve(this.ws);
    } else if (this.ws.readyState !== this.ws.CONNECTING) {
      this.ws = null;
      return this._openSocket();
    }
    return new Promise((res, rej) => {
      const waiting = () => {
        if (this.ws.readyState === this.ws.CONNECTING) {
          setTimeout(waiting, 100);
        } else if (this.ws.readyState !== this.ws.OPEN) {
          rej(Error(`Failed to open socket on ${this.url}`));
        } else {
          res(this.ws);
        }
      };
      waiting();
    });
  }

  _onmessage(event: MessageEvent<any>) {
    const data = JSON.parse(event.data);
    if (data.id) this._requests[data.id]?.(data.payload);
    this.onmessage?.(event);
  }

  onerror() {}
}

export default SocketClient;
