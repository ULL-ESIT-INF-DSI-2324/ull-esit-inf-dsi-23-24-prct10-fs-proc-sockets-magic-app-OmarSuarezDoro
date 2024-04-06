import net from 'net'
import { EventEmitter } from 'events';


export class CustomServer extends EventEmitter {
  private server_: net.Server;
  constructor() {
    super();
    this.server_ = net.createServer((socket: net.Socket) => {
      let wholeData = '';
      socket.on('data', (dataChunk) => {
        console.log('Data received: ' + dataChunk);
        wholeData += dataChunk;
        let messageLimit = wholeData.indexOf('\n');
        while (messageLimit !== -1) {
          const message = wholeData.substring(0, messageLimit);
          wholeData = wholeData.substring(messageLimit + 1);
          this.emit('request', socket, JSON.parse(message));
          messageLimit = wholeData.indexOf('\n');
        }
      });
    })
  }
  start(kPort: number = 3000) {
    this.server_.listen(kPort, () => {
      console.log('Server listening on port ' + kPort);
    })
  }
}