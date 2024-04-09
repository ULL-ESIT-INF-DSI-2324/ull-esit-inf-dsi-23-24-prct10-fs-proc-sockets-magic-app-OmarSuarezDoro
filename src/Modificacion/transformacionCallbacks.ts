import net from 'net'
import { CustomServer } from '../ArchivosNuevos/EventEmitterClasses.js';
import { Card } from '../ArchivosAntiguos/Card.js';
import { ServerFunctionality } from './ServerFunctionality.js'
import {requestMessage } from '../ArchivosNuevos/customTypes.js'


// Create the server and start it listening on port
const server = new CustomServer();
server.start(8080);

// Handle request event (received the whole data from the client)
server.on('request', (data: requestMessage, socket: net.Socket) => {
  ServerFunctionality.checkUser(data.user, (err, _) => {
    if (err) {
      socket.write(err);
      socket.end();
      return;
    }
  });
  switch (data.action) {
    case 'list':
      let cards : Card[] = [];
      ServerFunctionality.listFunctionality(data, (err, data) => {
        if (err) {
          socket.write(err);
          socket.end();
          return;
        } 
        let parsedData = JSON.parse(data!);
        if (parsedData.statusCode !== 0) {
          cards.push(JSON.parse(data!).dataObj);
        }	else {
          console.log(cards);
          socket.write(JSON.stringify({statusCode: 203, dataObj: cards}) + '\n');
          socket.end();
        }
      });
      break;
    case 'list-unique':
      console.log('List unique action');
      ServerFunctionality.listUniqueFunctionality(data, (err, data) => {
        socket.write(err ?? data!);
        socket.end();
      });
      break;
    case 'add':
      console.log('Add action');
      ServerFunctionality.addFunctionality(data, (err, data) => {
        socket.write(err ?? data!);
        socket.end();
      });
      
    case 'delete':
      console.log('Delete action');
      ServerFunctionality.deleteFunctionality(data, (err, data) => {
        socket.write(err ?? data!);
        socket.end();
      });   
      break;
    case 'update':
      console.log('Update action');
      ServerFunctionality.updateFunctionality(data, (err, data) => {
        socket.write(err ?? data!);
        socket.end();
      });
      break;
    default:
      console.log('Invalid action');
      break;
  }
});

// Handle error event
server.on('error', (error) => {
  console.log(error);
});