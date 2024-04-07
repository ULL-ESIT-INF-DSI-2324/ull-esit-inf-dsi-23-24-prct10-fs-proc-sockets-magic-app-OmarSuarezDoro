
/**
 * Univeridad de La Laguna
 * Asignatura: Desarrollo de Sistemas Informáticos
 * Décima práctica de la asignatura DSI
 * Realizada por: Omar Suárez Doro
 * Correo: alu0101483474@ull.edu.es
 */

import { EventEmitter } from 'events';
import { COLOR, TYPE, RARITY } from '../ArchivosAntiguos/Card.js';
import { CardCreator, CreatureCardCreator, PlanesWalkerCardCreator } from '../ArchivosAntiguos/CardsCreaters.js';
import { hideBin } from 'yargs/helpers';
import net from 'net';
import yargs from 'yargs';
import chalk from 'chalk';

/**
 * @global
 * @type {requestMessage}
 * @description This object is used to send the message to the server
 */
export type requestMessage = {
  user: string,
  action: string,
  path: string,
  dataObj: any,
}

/**
 * @global
 */
let message: requestMessage;


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


function main() {
  yargs(hideBin(process.argv))
    .command('add', 'Adds a card to the collection', {
      user: {
        description: 'username of the user',
        type: 'string',
        demandOption: true
      },
      id: {
        description: 'Card ID',
        type: 'number',
        demandOption: true
      },
      name: {
        description: 'Card name',
        type: 'string',
        demandOption: true
      },
      mana_cost: {
        description: 'Card mana cost',
        type: 'number',
        demandOption: true
      },
      color: {
        description: 'Card color',
        type: 'string',
        demandOption: true
      },
      type: {
        description: 'Card type',
        type: 'string',
        demandOption: true
      },
      rarity: {
        description: 'Card rarity',
        type: 'string',
        demandOption: true
      },
      rules_text: {
        description: 'Card rules text',
        type: 'string',
        demandOption: true
      },
      market_value: {
        description: 'Card market value',
        type: 'number',
        demandOption: true
      },
      power: {
        description: 'Card power',
        type: 'number',
        demandOption: false
      },
      toughness: {
        description: 'Card toughness',
        type: 'number',
        demandOption: false
      },
      loyalty_marks: {
        description: 'Card loyalty marks',
        type: 'number',
        demandOption: false
      }
    }, (argv) => {
      if (argv.type === 'creature' && (!argv.power || !argv.toughness)) {
        console.log('The power and toughness are required for creature cards');
        return;
      }
      if (argv.type === 'planeswalker' && !argv.loyalty_marks) {
        console.log('The loyalty marks are required for planeswalker cards');
        return;
      }
      if (!Object.values(TYPE).some((element) => argv.type === element)) {
        console.error(chalk.red('[-] The type is not suported'));
        return;
      }
      message = {
        user: argv.user,
        action: 'add',
        dataObj: {
          id_: argv.id,
          name_: argv.name,
          mana_cost_: argv.mana_cost,
          color_: argv.color as COLOR,
          type_: argv.type as TYPE,
          rarity_: argv.rarity as RARITY,
          rules_text_: argv.rules_text,
          market_value_: argv.market_value
        },
        path: '-1'
      }
      if (argv.power) {
        message.dataObj['power_'] = argv.power;
      }
      if (argv.toughness) {
        message.dataObj['toughness_'] = argv.toughness;
      }
      if (argv.loyalty_marks) {
        message.dataObj['loyalty_marks_'] = argv.loyalty_marks;
      }
    })
    .command('modify', 'Modify a card of a collection', {
      user: {
        description: 'username of the user',
        type: 'string',
        demandOption: true
      },
      id: {
        description: 'Card ID',
        type: 'number',
        demandOption: true
      },
      name: {
        description: 'Card name',
        type: 'string',
        demandOption: false
      },
      mana_cost: {
        description: 'Card mana cost',
        type: 'number',
        demandOption: false
      },
      color: {
        description: 'Card color',
        type: 'string',
        demandOption: false
      },
      type: {
        description: 'Card type',
        type: 'string',
        demandOption: false
      },
      rarity: {
        description: 'Card rarity',
        type: 'string',
        demandOption: false
      },
      rules_text: {
        description: 'Card rules text',
        type: 'string',
        demandOption: false
      },
      market_value: {
        description: 'Card market value',
        type: 'number',
        demandOption: false
      },
      power: {
        description: 'Card power',
        type: 'number',
        demandOption: false
      },
      toughness: {
        description: 'Card toughness',
        type: 'number',
        demandOption: false
      },
      loyalty_marks: {
        description: 'Card loyalty marks',
        type: 'number',
        demandOption: false
      }
    }, (argv) => {
      message = {
        user: argv.user,
        action: 'update',
        path: argv.id.toString(),
        dataObj: {
          id_: argv.id,
        }
      }
      if (argv.name) {
        message.dataObj['name_'] = argv.name;
      }
      if (argv.mana_cost) {
        message.dataObj['mana_cost_'] = argv.mana_cost;
      }
      if (argv.color) {
        message.dataObj['color_'] = argv.color;
      }
      if (argv.type) {
        message.dataObj['type_'] = argv.type;
      }
      if (argv.rarity) {
        message.dataObj['rarity_'] = argv.rarity;
      }
      if (argv.rules_text) {
        message.dataObj['rules_text_'] = argv.rules_text;
      }
      if (argv.market_value) {
        message.dataObj['market_value_'] = argv.market_value;
      }
      if (argv.power) {
        message.dataObj['power_'] = argv.power;
      }
      if (argv.toughness) {
        message.dataObj['toughness_'] = argv.toughness;
      }
      if (argv.loyalty_marks) {
        message.dataObj['loyalty_marks_'] = argv.loyalty_marks;
      }
    })
    .command('remove', 'Remove a card from a collection', {
      user: {
        description: 'username of the user',
        type: 'string',
        demandOption: true
      },
      id: {
        description: 'Card ID',
        type: 'number',
        demandOption: true
      }
    }, (argv) => {
      message = {
        user: argv.user,
        action: 'delete',
        path: '-1',
        dataObj: {
          id_: argv.id,
        }
      }
    })
    .command('show', 'Show the collection', {
      user: {
        description: 'username of the user',
        type: 'string',
        demandOption: true
      }
    }, (argv) => {
      message = {
        user: argv.user,
        action: 'list',
        dataObj: null,
        path: '-1'
      }
    })
    .help()
    .argv;
  initializeServer();
}

function initializeServer() {
  let client = new MessageEventEmitterClient(net.connect({ port: 8080 }));

  client.on('response', (data) => {
    switch (data.statusCode) {
      case 0:
        client.getConnection.end();
        break;
      case 200:
        if (data.dataObj) {
          let generator: CardCreator;
          switch (data.dataObj.type_) {
            case 'creature':
              generator = new CreatureCardCreator(data.dataObj.id_, data.dataObj.name_, data.dataObj.mana_cost_, data.dataObj.color_ as COLOR, data.dataObj.type_ as TYPE, data.dataObj.rarity_ as RARITY,
                data.dataObj.rules_text_, data.dataObj.market_value_, data.dataObj.power_, data.dataObj.toughness_);
              break;
            case 'planeswalker':
              generator = new PlanesWalkerCardCreator(data.dataObj.id_, data.dataObj.name_, data.dataObj.mana_cost_, data.dataObj.color_ as COLOR, data.dataObj.type_ as TYPE, data.dataObj.rarity_ as RARITY,
                data.dataObj.rules_text_, data.dataObj.market_value_, data.dataObj.loyalty_marks_);
              break;
            default:
              generator = new CardCreator(data.dataObj.id_, data.dataObj.name_, data.dataObj.mana_cost_, data.dataObj.color_, data.dataObj.type_, data.dataObj.rarity_, data.dataObj.rules_text_, data.dataObj.market_value_);
          }
          console.log(generator.createCard().toString() + '\n');
        } else {
          console.log(data.dataObj);
        }
        break;
      case 201:
        console.log(chalk.green(`[✔] ${data.dataObj}`));
        break;
      default:
        console.log(chalk.red(`[❌] ERROR ${data.statusCode}: ${data.dataObj}`));
    }
  });

  client.getConnection.on('connect', () => {

    client.getConnection.write(JSON.stringify(message) + '\n');
  });

  client.getConnection.on('end', () => {
    console.log('MIAU!, Server closed connection');
  });
}

main();