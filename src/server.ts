import { CustomServer } from './CustomServer.js';
import { Card } from './Card.js';
import { CreatureCard } from './CreatureCard.js';
import { PlanesWalkerCard } from './PlanesWalkerCard.js';
//import fs from 'fs';
import net from 'net';

/**
 * This interface represents a request message
 */
export type requestMessage = {
  user: string,
  action: string,
  dataObj: Card | null,
}

export type cardSerialized = {
  id: number,
  name: string,
  mana_cost: number,
  color: string,
  type: string,
  rarity: string,
  rules_text: string,
  market_value: number,
  power?: number,
  toughness?: number,
  loyalty_marks?: number
}

/**
 * This enum represent the color
 */
export enum COLOR {
  WHITE = 'white',
  BLUE = 'blue',
  BLACK = 'black',
  RED = 'red',
  GREEN = 'green',
  NOCOLOR = 'nocolor',
  MULTICOLOR = 'multicolor'
}

/**
 * This enum represent the type of card
 */
export enum TYPE {
  LAND = 'land',
  CREATURE = 'creature',
  ENCHANTMENT = 'enchantment',
  INSTANT = 'instant',
  SORCERY = 'sorcery',
  ARTIFACT = 'artifact',
  PLANESWALKER = 'planeswalker'
}

/**
 * This enum represent the rarity of the card
 */
export enum RARITY {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  MYTHIC = 'mythic'
}

// Create the server and start it listening on port
const server = new CustomServer();
server.start(3000);

// Handle request event (received the whole data from the client)
server.on('request', (connection: net.Socket, data: requestMessage) => {
  // if (data.dataObj && data.dataObj.type === 'creature') {
  //   data.dataObj = data.dataObj as CreatureCard;
  // } else if (data.dataObj && data.dataObj.type === 'planeswalker') {
  //   data.dataObj = data.dataObj as PlanesWalkerCard;
  // }
  // try {
  //   connection.write(JSON.stringify({ statusCode: 200, message: 'List action' }) + '\n');
  // } catch (error) {
  //   console.log('Error al escribir en el socket:', error);
  // }
  // switch (data.action) {
  //   case 'list':
  //     // use the readdir method to read all files in a directory
  //     connection.write(JSON.stringify({ statusCode: 200, message: 'List action' }) + '\n');
  //     fs.readdir(`./Database/${data.user.toLowerCase().replace(/\s/g, '_')}`, (err, files) => {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         files.forEach(file => {
  //           fs.readFile(`./Database/${data.user.toLowerCase().replace(/\s/g, '_')}/${file}`, 'utf8', (err, data) => {
  //             if (err) {
  //               console.log(err);
  //             } else {
  //               data;
  //             }
  //           });
  //         });
  //       }
  //     });
  //     break;
  //   case 'add':
  //     console.log('Add action');
  //     break;
  //   case 'delete':
  //     console.log('Delete action');
  //     break;
  //   default:
  //     console.log('Invalid action');
  //     break;
  // }
});

// Handle error event
server.on('error', (error) => {
  console.log(error);
});