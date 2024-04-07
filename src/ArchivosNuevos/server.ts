import net from 'net'
import { EventEmitter } from 'events';
import { Card, RARITY, TYPE, COLOR } from '../ArchivosAntiguos/Card.js';
import { CardCreator, CreatureCardCreator, PlanesWalkerCardCreator } from '../ArchivosAntiguos/CardsCreaters.js';
import fs, { stat } from 'fs';

export type requestMessage = {
  user: string,
  action: string,
  path: string,
  dataObj: any,
}

export class CustomServer extends EventEmitter {
  private server_: net.Server;
  constructor() {
    super();
    this.server_ = net.createServer((socket: net.Socket) => {
      let wholeData = '';
      socket.on('data', (dataChunk) => {
        wholeData += dataChunk;
        let messageLimit = wholeData.indexOf('\n');
        while (messageLimit !== -1) {
          const message = wholeData.substring(0, messageLimit);
          wholeData = wholeData.substring(messageLimit + 1);
          this.emit('request', JSON.parse(message), socket);
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

  static parseCard(data: any): Card {
    let generator: CardCreator;
    switch (data.type_) {
      case 'creature':
        generator = new CreatureCardCreator(data.id_, data.name_, data.mana_cost_, data.color_ as COLOR, data.type_ as TYPE, data.rarity_ as RARITY,
          data.rules_text_, data.market_value_, data.power_, data.toughness_);
        break;
      case 'planeswalker':
        generator = new PlanesWalkerCardCreator(data.id_, data.name_, data.mana_cost_, data.color_ as COLOR, data.type_ as TYPE, data.rarity_ as RARITY,
          data.rules_text_, data.market_value_, data.loyalty_marks_);
        break;
      default:
        generator = new CardCreator(data.id_, data.name_, data.mana_cost_, data.color_, data.type_, data.rarity_, data.rules_text_, data.market_value_);
    }
    return generator.createCard();
  }
}

// Create the server and start it listening on port
const server = new CustomServer();
server.start(8080);

// Handle request event (received the whole data from the client)
server.on('request', (data: requestMessage, socket: net.Socket) => {
  stat(`./Database/${data.user.toLowerCase().replace(/\s/g, '_')}`, (err) => {
    if (err) {
      socket.write(JSON.stringify({ statusCode: -1, dataObj: 'The user does not exist!' }) + '\n');
      socket.write(JSON.stringify({ statusCode: 0 }) + '\n');
      return;
    }
  });
  switch (data.action) {
    case 'list':
      fs.readdir(`./Database/${data.user.toLowerCase().replace(/\s/g, '_')}`, (err, files) => {
        if (err) {
          console.error(err);
        } else {
          files.forEach(file => {
            fs.readFile(`./Database/${data.user.toLowerCase().replace(/\s/g, '_')}/${file}`, 'utf8', (err, data) => {
              if (err) {
                console.error(err);
              } else {
                let parsedCard: Card = CustomServer.parseCard(JSON.parse(data));
                socket.write(JSON.stringify({ statusCode: 200, user: JSON.parse(data).user, type: parsedCard.type, dataObj: parsedCard }) + '\n');
                // socket.end();
              }
            });
          });
          // socket.write(JSON.stringify({ statusCode: 0 }) + '\n');
        }
      });
      break;
    case 'add':
      console.log('Add action');
      let card: Card = CustomServer.parseCard(data.dataObj);
      fs.stat(`./Database/${data.user.toLowerCase().replace(/\s/g, '_')}/${card.id}.json`, (err) => {
        if (err) {
          fs.writeFile(`./Database/${data.user.toLowerCase().replace(/\s/g, '_')}/${card.id}.json`, JSON.stringify(data.dataObj, null, 2), (err) => {
            if (err) {
              console.error(err);
              socket.write(JSON.stringify({ statusCode: -1, dataObj: 'Error while writing the file' }) + '\n');
              socket.end();
            } else {
              socket.write(JSON.stringify({ statusCode: 201, dataObj: 'The file was saved successfully!' }) + '\n');
              socket.end();
            }
          });
          return;
        } else {
          socket.write(JSON.stringify({ statusCode: -2, dataObj: 'The file already exists!' }) + '\n');
          socket.end();
        }
      });
      break;
    case 'delete':
      console.log('Delete action');
      console.log(`./Database/${data.user.toLowerCase().replace(/\s/g, '_')}/${data.dataObj.id_}.json`);
      fs.stat(`./Database/${data.user.toLowerCase().replace(/\s/g, '_')}/${data.dataObj.id_}.json`, (err) => {
        if (err) {
          socket.write(JSON.stringify({ statusCode: -1, dataObj: 'The file does not exist!' }) + '\n');
          socket.end();
          return;
        } else {
          fs.unlink(`./Database/${data.user.toLowerCase().replace(/\s/g, '_')}/${data.dataObj.id_}.json`, (err) => {
            if (err) {
              socket.write(JSON.stringify({ statusCode: -3, dataObj: 'Error while deleting the file' }) + '\n');
              socket.end();
            } else {
              socket.write(JSON.stringify({ statusCode: 201, dataObj: 'The file was deleted successfully!' }) + '\n');
              socket.end();
            }
          });
        }
        // socket.write(JSON.stringify({ statusCode: 0 }) + '\n');
      });

      break;
    case 'update':
      console.log('Update action');
      fs.stat(`./Database/${data.user.toLowerCase().replace(/\s/g, '_')}/${data.path}.json`, (err) => {
        if (err) {
          socket.write(JSON.stringify({ statusCode: -2, dataObj: 'The file does not exist!' }) + '\n');
          socket.end();
          return;
        } else {
          fs.readFile(`./Database/${data.user.toLowerCase().replace(/\s/g, '_')}/${data.path}.json`, 'utf8', (err, readData) => {
            if (err) {
              console.error(err);
              socket.write(JSON.stringify({ statusCode: -1, dataObj: 'Error while reading the file' }) + '\n');
              socket.end();
              return;
            }
            let readObj = JSON.parse(readData);
            for (let key in data.dataObj) {
              readObj[key] = data.dataObj[key];
            }
            console.log(readObj);
            fs.writeFile(`./Database/${data.user.toLowerCase().replace(/\s/g, '_')}/${data.path}.json`, JSON.stringify(readObj, null, 2), (err) => {
              if (err) {
                console.error(err);
                socket.write(JSON.stringify({ statusCode: -4, dataObj: 'Error while writing the file' }) + '\n');
                socket.end();
              } else {
                socket.write(JSON.stringify({ statusCode: 201, dataObj: 'The file was updated successfully!' }) + '\n');
                socket.end();
              }
            });
          });
          // socket.write(JSON.stringify({ statusCode: 0 }) + '\n');
        }
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