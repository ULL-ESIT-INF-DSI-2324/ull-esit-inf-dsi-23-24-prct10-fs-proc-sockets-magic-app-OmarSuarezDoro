import { CustomServer } from './CustomServer.js';
import { Card } from './Card.js';

export type requestMessage = {
  user: string,
  action: string,
  dataObj: Card | null,
}

// Create the server and start it listening on port
const server = new CustomServer();
server.start(3000);

// Handle request event (received the whole data from the client)
server.on('request', (data : requestMessage) => {
  console.log(data);
  console.log(data.user);
  console.log(data.action);
  console.log(data.dataObj);
});

// Handle error event
server.on('error', (error) => {
  console.log(error);
});