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

  it('Should return the expected message for list', (done) => {
    const client = new MessageEventEmitterClient(net.connect({ port: 8080 }));
    let message = {
      user: 'Test User2',
      action: 'list',
      dataObj: null,
      path: '-1'
    }
    client.getConnection.on('connect', () => {
      console.log('Connected');
      client.getConnection.write(JSON.stringify(message));
    });

    client.on('response', (data) => {
      console.log(data);
      expect(data).to.be.eql({ 'statusCode': 203, 'dataObj': [] }); // TOFIX - This is not the expected response
      done();
    });

  });
  
  it('Should return the expected message for list-unique', (done) => {
    const client = new MessageEventEmitterClient(net.connect({ port: 8080 }));
    let message = {
      user: 'Test User',
      action: 'list-unique',
      dataObj: { id: 1 },
      path: '-1'
    }
    client.getConnection.on('connect', () => {
      console.log('Connected');
      client.getConnection.write(JSON.stringify(message));
    });
  
    client.on('response', (data) => {
      console.log(data);
      expect(data).to.be.eql({ 'statusCode': 203, 'dataObj': [] }); // TOFIX - This is not the expected response
      done();
    });
  });
});

