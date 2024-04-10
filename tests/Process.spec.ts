import 'mocha';
import { expect } from 'chai';
import net from 'net';
import { MessageEventEmitterClient } from '../src/ArchivosNuevos/EventEmitterClasses.js';



describe('MessageEventEmitterClient and Server Custom', () => {
  it('Should emit a response event once it gets a complete message', (done) => {
    const socket = new net.Socket();
    const client = new MessageEventEmitterClient(socket);
    client.on('response', (message) => {
      expect(message).to.be.eql({ 'statusCode': 200, 'data': 'miau miau miau', 'userAgent': 'Firefox' });
      done();
    });

    socket.emit('data', '{"statusCode": 200, "data": "miau miau miau"');
    socket.emit('data', ', "userAgent": "Firefox"}');
    socket.emit('data', '\n');
  });
});