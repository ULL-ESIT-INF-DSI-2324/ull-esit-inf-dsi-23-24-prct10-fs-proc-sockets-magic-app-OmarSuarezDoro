import { EventEmitter } from 'events';
import { Card, RARITY, TYPE, COLOR } from '../ArchivosAntiguos/Card.js';
import { CardCreator, CreatureCardCreator, PlanesWalkerCardCreator } from '../ArchivosAntiguos/CardsCreaters.js';
import net from 'net';

/**
 * This class is used to create a client that emits events when a message is received from the server
 */
export class MessageEventEmitterClient extends EventEmitter {
  constructor(private connection: net.Socket) {
    super();
    let wholeData = '';
    connection.on('data', (dataChunk) => {
      wholeData += dataChunk;
      let messageLimit = wholeData.indexOf('\n');
      while (messageLimit !== -1) {
        const message = wholeData.substring(0, messageLimit);
        wholeData = wholeData.substring(messageLimit + 1);
        this.emit('response', JSON.parse(message));
        messageLimit = wholeData.indexOf('\n');
      }
    });
  }

  get getConnection() {
    return this.connection;
  }
}

/**
 * This class is used to create a server that emits events when a message is received from a client
 */
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