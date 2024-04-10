- Autor: **Omar Suárez Doro** 
- Email: **alu0101483474@ull.edu.es**
- Asignatura: **Desarrollo de Sistemas Informáticos**
  
# Índice
- [Índice](#índice)
- [1. 📚 Introducción 📚](#1--introducción-)
- [2. 🧠 Trabajo previo 🧠](#2--trabajo-previo-)
- [3. 🖥️ Desarrollo de la práctica 🖥️](#3-️-desarrollo-de-la-práctica-️)
- [4. Conclusiones](#4-conclusiones)
- [5. Referencias](#5-referencias)

# 1. 📚 Introducción 📚
Este informe tiene como objetivo la redacción de los pasos seguidos durante el desarrollo de la décima practica de la asignatura **Desarrollo de Sistemas Informáticos**.

# 2. 🧠 Trabajo previo 🧠

Para la realización de esta práctica, en primer lugar se han visualizado los vídeos se ha leido y entendido la documentación de [yargs](https://www.npmjs.com/package/yargs), y por otro lado, [chalk](https://www.npmjs.com/package/chalk). A su vez, se han elaborado los siguientes resumenes acerca de la configuración del repositorio.

> [!Important]
> # GitHub Actions
> 1. Nos dirigimos a la pestaña `actions` en el repositorio de GitHub. Si nos centramos en *Continuous integration workflows*, seleccionamos [Node.js](https://nodejs.org/en).
> 
> 2. La estructura del archivo `node.js.yml` es la siguiente:
> - name: Nombre del flujo de trabajo
> - Pull y Push: Cada vez que se realice un push o un pull en la rama main, se realizarán los jobs especificados.
> - jobs: Los trabajos a realizar, un ejemplo sería el siguiente.
> ```js
> name: Tests
> on:
>   push:
>      branches: [ main ]
>   pull_request:
>      branches: [ main ]
> 
> jobs:
>  build:
>    runs-on: ubuntu-latest # Se debe correr en la última versión de ubuntu estable
>
>    strategy:
>      matrix:
>        node-version: [16.x, 18.x, 19.x, 20.x, 21.x] # Se ejecuta en todos estornos.
>        # See supported Node.js release schedule at https://nodejs.org/en/about/releases/
>
>    steps: # Pasos a arealizar
>    - uses: actions/checkout@v4
>    - name: Use Node.js ${{ matrix.node-version }}
>      uses: actions/setup-node@v4
>      with:
>        node-version: ${{ matrix.node-version }} # Configuración del entorno.
>    - run: npm install
>    - run: npm test
> ```
> 3. Realizar un commit (se habrá creado un fichero para nuestra github action).
> 4. Se puede crear un badge (opcional)
> # Integración de Coveralls en GitHub action
> 5. Desinstalamos Coveralls `npm uninstall coveralls`.
> 6. Modificación del script coverage
> ```json
> "coverage": "nyc npm test && nyc report --reporter=lcov",
> ```
> 7. Creamos en el directorio `.github/workflows` un nuevo fichero `coveralls.yml`.
>
> ```js
> name: Coveralls
> on:
>   push:
>      branches: [ main ]
>   pull:
>      branches: [ main ]
> 
> jobs:
>  build:
>
>    runs-on: ubuntu-latest
>
>    steps:
>    - name: Cloning repo
>      uses: actions/checkout@v4
>    - name: Use Node.js 21.x
>      uses: actions/setup-node@v4
>      with:
>        node-version: 21.x
>    - name: Installing dependencies
>      run: npm install
>    - name: Generating coverage information
>      run: npm run coverage
>    - name: Coveralls GitHub Action
>      uses: coverallsapp/github-action@v2.2.3
>      with:
>        github-token: ${{ secrets.GITHUB_TOKEN }}
> ```
> 
> # Integración de SonarCloud en GitHub action
> 8. Inicio de sesión en la web de [SonarCloud](https://sonarcloud.io)
> 9. Se añade el repositorio en cuestión.
> 10. Nos dirigimos a la pestaña de `Administration > Analysis Method` y desactivamos el análisis automático.
> 11. En esa misma pestaña, en el apartado `with Github Actions` hacemos click y copiamos el token.
> 12. En Github en la configuración del repositorio, concretamente en el apartado `Secrets and variables`, añadimos un nuevo secreto con la información obtenida.
> 13. En la misma página que estábamos seleccionamos la opción de JS en el siguiente paso y copiamos el contenido que se proporciona para la action.
> 
>

# 3. 🖥️ Desarrollo de la práctica 🖥️

En esta práctica se propone implementar una aplicación cliente / servidor que gestione colecciones de cartas de Magic. Para la realización de esta
práctica, se ha tenido que reacondiciona la solución propuesta para la práctica anterior, pues se realizaba el manejo de cartas en memoria, y luego se transmitían los cambios al sistema de archivos, para todo esto en primer lugar se inicializaba una aplicación con el usuario que se vaya a utilizar para la gestión.

En primer lugar se va a analizar la parte del servidor. Para empezar, se creó una clase para poder emitir el evento personalizado `request` solicitado por parte del servidor:
```ts
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
```

Como se puede apreciar, el constructor tiene como objetivo principal manerar el evento data, para poder emitir el evento personalizado si fuese necesario. A continuación, se puede apreciar un método `Start`, cuyo objetivo principal es el inicio del servidor. Finalmente apreciamos un método parsecard, que tiene como objetivo facilitar las expresiones para la construcción de objetos. Para poder conseguirlo, se ha empleado un patrón de factoryMethod implementado para la práctica anterior.

Si analizamos ahora el código que permite llevar a cabo toda la funcionalidad, es el correspondiente al manejador del evento `request`:
```ts
server.on('request', (data: requestMessage, socket: net.Socket) => {
  stat(`./Database/${data.user.toLowerCase().replace(/\s/g, '_')}`, (err) => {
    if (err) {
      socket.write(JSON.stringify({ statusCode: -1, dataObj: 'The user does not exist!' }) + '\n');
      socket.end();
      return;
    }
  });
  switch (data.action) {
   // Implementación de la funcionalidad
  }
});
```

Como se puede apreciar, se recibe la petición, y lo primero es comprobar si el usuario existe, en caso de que no existe, se finaliza la conexión. A continuación podemos observar que se comienza el switch que dependerá del valor de la propiedad action (que actuará como comando). Aclarar que en cada funcionalidad se comprueba mediante el método `stat` si el archivo existe o no.

A continuación vamos a analizar el código de cada funcionalidad:
- Funcionalidad de añadir:
```ts
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
```

Lo recalcable en este fragmento de código es la sustitución de los métodos asíncronos de la anterior práctica, por los métodos asíncronos. Esto obliga al uso de `socket.end()` en varios puntos del código.

- Funcionalidad borrado:
```ts
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
```
Esta funcionalidad sigue la misma lógica que la anterior, lo único que se ha empleado el método `unlink`.

- Funcionalidad modificar
```ts
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
        }
      });
      break;
```
Esta funcionalidad resulta ser un poco más compleja, pues se realiza:
  1. Se comprueba si el archivo exista.
  2. Se lee el contenido del archivo
  3. Se itera por el objeto recibido a través del mensaje (dataObj), y se modifican las cualidades del objeto leido
  4. Se escribe el contenido del archivo

- Funcionalidad listar cartas

```ts
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
          socket.write(JSON.stringify({ statusCode: 0 }) + '\n');
        }
      });
      break;
```
Esta funcionalidad cambia un poco. Como se puede apreciar se leen el contenido de los ficheros del directorio, y se emiten mensajes con la información de cada carta. En un primer momento, se pensó en enviar un array con todas las cartas, sin embargo, por como funciona el bucle de eventos de node, junto a la pila de llamadas, sucedía el caso de que se enviaba dicha estructura de datos vacía. Por otro lado, se pretendía acabar la conexión por parte del cliente haciendo uso de  `socket.end()`, sin embargo en ese caso solo enviaría la información de una carta. Por lo que debido a estas dificultades, se ha decidido enviar un statusCode de 0 en el mensaje para indicar al cliente el fin de la conexión. Esto no satisface el requisito que se exigía respecto al cierre de la conexión por parte del cliente, pero no he encontrado otra forma.
list
- Funcionalidad de listar una carta en específica

```ts
    case 'list-unique':
      fs.stat(`./Database/${data.user.toLowerCase().replace(/\s/g, '_')}/${data.dataObj.id}.json`, (err) => {
        if (err) {
          socket.write(JSON.stringify({ statusCode: -2, dataObj: 'The file does not exist!' }) + '\n');
          socket.end();
          return;
        } else {
          fs.readFile(`./Database/${data.user.toLowerCase().replace(/\s/g, '_')}/${data.dataObj.id}.json`, 'utf8', (err, data) => {
            if (err) {
              console.error(err);
              socket.write(JSON.stringify({ statusCode: -1, dataObj: 'Error while reading the file' }) + '\n');
              socket.end();
              return;
            }
            let parsedCard: Card = CustomServer.parseCard(JSON.parse(data));
            socket.write(JSON.stringify({ statusCode: 200, user: JSON.parse(data).user, type: parsedCard.type, dataObj: parsedCard }) + '\n');
            socket.end();
          });
        }
      });
      break;
```
Para esta funcionalidad por simplicidad se ha decidido que se pueda listar únicamente por el DNI. En este caso si podemos finalizar la conexión a diferencia del anterior.


Una vez revisada la parte del servidor procedemos con la relativa al cliente. En primer lugar, la clase personalizada para poder emitir un evento personalizado para manejar múltiples eventos data, emitiendo un evento `response`:
```ts
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
```
Nótese que en la clase se ha añadido un método get connection, para poder añadir eventos al socket de la conexión, pues no se quería tener todo en el constructor.

Si nos centramos en el cliente, solo quiero aclarrar que se inicializar un cliente, se recoge el input mediante el uso de xargs, y se modifica una variable global, conocida como message. Una vez recogido el input, se inicializa el servidor, y a continuación se define la acción que se realizará tras conectarse al servidor (emitir el mensaje).

```ts
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
    // console.log(message);
    client.getConnection.write(JSON.stringify(message) + '\n');
  });

  client.getConnection.on('end', () => {
    console.log('MIAU!, Server closed connection');
  });
}
```
Estas líneas son las verdaderamente importantes. Aclarar que si se recibe un código de estado 0, finalizaremos la conexión por parte del cliente. Si se recibe un sc de 200, transformaremos el objeto en su respectiva representación en carta, con el objetivo de poder usar el método toStringg y así el paquete chalk. Si se recibe un 201 se considerará que todo ha ido bien. Si ningún código de estado coincide. Se considerará un error.

```ts
  client.getConnection.on('end', () => {
    console.log('Server closed connection');
  });
```

Finalmente se define el manejador del evento end para cuando se cierra la conexión.
## Modificación
Para la modificación se ha solicitado que dos de las funciones de la práctica 9 se implementasen mediante el uso de funciones asíncronas que empleen callbacks. Para el estudio de la modificación se reimplementó el servidor de esta práctica para que hiciese uso pleno del patrón callback, obteniendo así un código más limpio. Los archivos del servidor nuevo, se encuentran en la carpeta de modificación. Se comentará por encima el nuevo enfoque que se le quiso dar:

El servidor ahora al tener callbacks, se ha empleado el siguiente tipo de manejador:
```ts
  case 'add':
    console.log('Add action');
    ServerFunctionality.addFunctionality(data, (err, data) => {
      socket.write(err ?? data!);
      socket.end();
    });
  break;
```

El único manejador distinto resulta el del list, pues se emite el statusCode a 0 para indicar al cliente el final de la conexión.

```ts
  case 'list':
    ServerFunctionality.listFunctionality(data, (err, data) => {
      if (err) {
        socket.write(err);
        socket.end();
        return;
      } 
      let parsedData = JSON.parse(data!);
      if (parsedData.statusCode === 0) {
        socket.write(JSON.stringify({statusCode: 0}) + '\n');
      }	else {
        socket.write(JSON.stringify({statusCode: 200, dataObj: JSON.parse(data!).dataObj}) + '\n');
        }
      });
    break;
```
El código de las funcionalidades ubicadas en el archivo `ServerFunctionality.ts`, conincide con lo ya mostrado, sino que se ha implementado el patrón callback, un ejemplo de implementación es el siguiente:
```ts
  static addFunctionality(dataInput: requestMessage, callback: (error: string | undefined, data: string | undefined) => void) {
    let card: Card = this.parseCard(dataInput.dataObj);
    fs.stat(`./Database/${dataInput.user.toLowerCase().replace(/\s/g, '_')}/${card.id}.json`, (err) => {
      if (!err) {
        callback(JSON.stringify({ statusCode: -2, dataObj: 'The file already exists!' }) + '\n', undefined);
        return;
      }
      fs.writeFile(`./Database/${dataInput.user.toLowerCase().replace(/\s/g, '_')}/${card.id}.json`, JSON.stringify(dataInput.dataObj, null, 2), (err) => {
        if (err) {
          callback(JSON.stringify({ statusCode: -1, dataObj: 'Error while writing the file' }) + '\n', undefined);
        } else {
          callback(undefined, JSON.stringify({ statusCode: 201, dataObj: 'The file was saved successfully!' }) + '\n');
        }
      });
    });
  }
```
Nótese el undefined para los errores, cuando se ha satisfecho la operación, y en el data para cuando suceden errores.


# 4. Conclusiones
Tras la realización de la práctica se ha comprendido perfectamente el funcionamiento del paquete xargs y chalk. Además de aprender el manejo de la API asícrona de node File System. Además de aumentar el conocimiento acerca del manejo de servidores, uso del módulo net de nodejs.

# 5. Referencias
- [Documentación del módulo FileSystem de Node](https://nodejs.org/api/fs.html)
- [Vídeo acerca del FileSystem de Node](https://www.youtube.com/watch?v=8JYBwCaZviE)