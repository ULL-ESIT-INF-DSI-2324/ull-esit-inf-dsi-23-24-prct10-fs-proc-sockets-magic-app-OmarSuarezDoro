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

  it('Should return the expected message list-unique fine operation', (done) => {
    const client = new MessageEventEmitterClient(net.connect({ port: 8080 }));
    let message = {
      user: 'Test User2',
      action: 'list-unique',
      dataObj: { id: 1 },
      path: '-1'
    }
    client.getConnection.write(JSON.stringify(message) + '\n');

    client.on('response', (data) => {
      expect(data).to.be.eql({
        'statusCode': 200, 'dataObj': {
          color_: "nocolor",
          id_: 1,
          loyalty_marks_: 5,
          mana_cost_: 2,
          market_value_: 10,
          name_: "cartita1",
          rarity_: "common",
          rules_text_: "Esto hace cosas",
          type_: "planeswalker"
        },
        type: "planeswalker"
      });
      done();
    });
  });

  it('Should return the expected message list-unique bad id operation', (done) => {
    const client = new MessageEventEmitterClient(net.connect({ port: 8080 }));
    let message = {
      user: 'Test User2',
      action: 'list-unique',
      dataObj: { id: -1 },
      path: '-1'
    }
    client.getConnection.write(JSON.stringify(message) + '\n');

    client.on('response', (data) => {
      expect(data).to.be.eql({ 'statusCode': -2, 'dataObj': "The file does not exist!" })
      done();
    });
  });

  it('Should return the fine operation of add a card', (done) => {
    const client = new MessageEventEmitterClient(net.connect({ port: 8080 }));
    let message = {
      user: 'Test User',
      action: 'add',
      dataObj: {
        id_: '52',
        name_: 'Carta de testeo',
        mana_cost_: '2',
        color_: 'blue',
        type_: 'card',
        rarity_: 'common',
        rules_text_: 'Esta carta es trampa tenerlo',
        market_value_: 10
      },
      path: '-1'
    }
    client.getConnection.write(JSON.stringify(message) + '\n');

    client.on('response', (data) => {
      expect(data).to.be.eql({ 'statusCode': 201, 'dataObj': "The file was saved successfully!" })
      done();
    });
  });

  it('Should return the fine operation of delete a card', (done) => {
    const client = new MessageEventEmitterClient(net.connect({ port: 8080 }));
    let message = {
      user: 'Test User',
      action: 'delete',
      dataObj: {
        id_: '52',
      },
      path: '-1'
    }
    client.getConnection.write(JSON.stringify(message) + '\n');

    client.on('response', (data) => {
      expect(data).to.be.eql({ 'statusCode': 201, 'dataObj': "The file was deleted successfully!" })
      done();
    });
  });

  it('Should return the duplication operation of add a card', (done) => {
    const client = new MessageEventEmitterClient(net.connect({ port: 8080 }));
    let message = {
      user: 'Test User',
      action: 'add',
      dataObj: {
        id_: '1',
        name_: 'Carta de testeo',
        mana_cost_: '2',
        color_: 'blue',
        type_: 'card',
        rarity_: 'common',
        rules_text_: 'Esta carta es trampa tenerlo',
        market_value_: 10
      },
      path: '-1'
    }
    client.getConnection.write(JSON.stringify(message) + '\n');

    client.on('response', (data) => {
      expect(data).to.be.eql({ 'statusCode': -2, 'dataObj': "The file already exists!" })
      done();
    });
  });

  it('Should return the fine operation of delete a card', (done) => {
    const client = new MessageEventEmitterClient(net.connect({ port: 8080 }));
    let message = {
      user: 'Test User',
      action: 'delete',
      dataObj: {
        id_: '-32',
      },
      path: '-1'
    }
    client.getConnection.write(JSON.stringify(message) + '\n');

    client.on('response', (data) => {
      expect(data).to.be.eql({ 'statusCode': -1, 'dataObj': "The file does not exist!" })
      done();
    });
  });
});

