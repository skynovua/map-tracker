export type WsHandlers = {
  onOpen?: (event: Event, ws: WebSocket) => void;
  onMessage?: (data: string, event: MessageEvent) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
};

export class WsClient {
  private ws: WebSocket | null = null;
  private handlers: WsHandlers = {};
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(handlers: WsHandlers) {
    this.handlers = handlers;
    this.close();

    this.ws = new WebSocket(this.url);

    this.ws.onopen = (event) => {
      this.handlers.onOpen?.(event, this.ws!);
    };

    this.ws.onmessage = (event) => {
      this.handlers.onMessage?.(event.data, event);
    };

    this.ws.onerror = (event) => {
      this.handlers.onError?.(event);
    };

    this.ws.onclose = (event) => {
      this.handlers.onClose?.(event);
      this.ws = null;
    };
  }

  send(payload: unknown) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;

    const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
    this.ws.send(message);
    return true;
  }

  close() {
    if (!this.ws) return;

    this.ws.onopen = null;
    this.ws.onmessage = null;
    this.ws.onerror = null;
    this.ws.onclose = null;
    this.ws.close();
    this.ws = null;
  }

  isOpen() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
