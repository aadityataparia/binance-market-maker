type JSONValue =
    | string
    | JSONObject;

interface JSONObject {
    id?: string;
    [x: string]: JSONValue;
}

class SocketClient {
  _requests = {};

  url: string;
  protocol: string;
  ws: WebSocket;
  private _fallback: boolean;

  constructor(
    url: string,
    protocol: string
  ) {
    this.url = url;
    this.protocol = protocol;
  }

  connect() {
    return this._openSocket();
  }

  disconnect() {
    this.ws?.close();
  }

  send(message: JSONValue) {
    const id = typeof message === "object" ? message?.id : null;

    return this._openSocket()
      .then((ws: { send: (arg0: any) => void }) => {
        ws.send(message);
        return new Promise(res => {
          if (id) {
            this._requests[id] = (v: unknown) => {
              delete this._requests[id];
              res(v);
            }
          }
        });
      });
  }

  _openSocket() {
    if (!this.ws) {
      this.ws = new WebSocket(this.url, this.protocol);
      this.ws.onmessage = this._onmessage.bind(this);
    } else if (this.ws.readyState === this.ws.OPEN) {
      return Promise.resolve(this.ws);
    } else if (this.ws.readyState !== this.ws.CONNECTING) {
      this.ws = null;
      return this._openSocket();
    }
    const me = this;
    return new Promise((res, rej) => {
      function waiting() {
        if (me.ws.readyState === me.ws.CONNECTING) {
          setTimeout(waiting, 100);
        } else if (me.ws.readyState !== me.ws.OPEN) {
          rej(Error(`Failed to open socket on ${me.url}`));
        } else {
          res(me.ws);
        }
      }
      waiting();
    });
  }

  _onmessage(event: MessageEvent<any>) {
    const data = JSON.parse(event.data);
    if (data.id && this._requests[data.id]) {
      this._requests[data.id].res(data.payload);
    }
    this.onmessage(event);
  }

  onmessage(e: { data: string }) {}
}

export default SocketClient;
