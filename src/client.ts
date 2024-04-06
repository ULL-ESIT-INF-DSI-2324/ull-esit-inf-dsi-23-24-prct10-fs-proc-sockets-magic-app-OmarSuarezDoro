import net from 'net';
import { Card } from './Card.js';
import { MessageEventEmitterClient } from './ClientEventEmmiter.js'

export type sendMessage = {
  user: string,
  action: string,
  dataObj: Card | null,
}

export type responseMessage = {
  statusCode: number,
  message: Card[] | string
}

const kPort : number = 3000;
let socket = net.connect({port: kPort});
let customClient = new MessageEventEmitterClient(net.connect({port: kPort}));
socket.on('connect', () => {
  console.log('Connected to server');
  let message : sendMessage = {
    user: 'Test User',
    action: 'list',
    dataObj: null
  };
  socket.write(JSON.stringify(message) + '\n');
  socket.on('close', () => {
    console.log('Connection closed');
  });
});

customClient.on('response', (data: responseMessage) => {
  console.log('MIAU');
  console.log(data);
});