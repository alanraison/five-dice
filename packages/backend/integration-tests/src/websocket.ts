import {
  client as WebSocketClient,
  connection as Connection,
  Message,
} from 'websocket';
import { wsUrl } from './constants';

interface ConnectOpts {
  gameId?: string;
  name?: string;
}

export class WebSocketConnection {
  #client: WebSocketClient;
  #connection: Promise<Connection>;
  #listen: boolean = true;
  #url: string;

  constructor(opts: ConnectOpts) {
    this.#client = new WebSocketClient();
    this.#connection = new Promise<Connection>((resolve, reject) => {
      this.#client.on('connectFailed', reject);
      this.#client.on('httpResponse', (r) =>
        r.destroy(new Error(r.statusMessage))
      );
      this.#client.on('connect', resolve);
    });
    const url = new URL(wsUrl);
    if (opts.gameId) {
      url.searchParams.set('gameId', opts.gameId);
    }
    if (opts.name) {
      url.searchParams.set('name', opts.name);
    }
    this.#url = url.toString();
  }

  async close() {
    this.#listen = false;
    await this.#connection.then((c) => c.close());
  }

  async connect() {
    this.#client.connect(this.#url);
    await this.#connection;
    return this;
  }

  get connection() {
    return this.#connection;
  }

  private async oneMessage() {
    return new Promise<Message>(async (resolve) => {
      const handler = async (m: Message) => {
        const c = await this.connection;
        c.removeListener('message', handler);
        resolve(m);
      };
      const c = await this.connection;
      c.addListener('message', handler);
    });
  }

  private async *messages() {
    while (this.#listen) {
      const message = await this.oneMessage();
      if (message.type === 'utf8') {
        yield message.utf8Data;
      } else {
        throw new Error('unexpected binary data');
      }
    }
  }

  async nextMessage() {
    const next = await this.messages().next();
    if (next.done) {
      throw new Error('message stream has ended');
    }
    return next.value;
  }
}
