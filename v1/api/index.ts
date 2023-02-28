// NPM Modules
import 'dotenv/config';
import Fastify, { FastifyRequest } from 'fastify';
import socketioServer from 'fastify-socket.io';
import { join } from 'path';
const { readFile } = require('fs').promises

// ROUTE
import { Databases } from './route/database';
import { Blockchain } from './route/blockchain';
import { GunDb } from './route/gundb';

// Custom
import { vm, VMScript } from './config/vm'
import { ConsumeMessageInfo, ConsumeMessageWarningAndError } from './amqp/consumer';
import { Producer } from './amqp/producer';
import { devDb, main, ObjectId } from "./config/db";
import {server as gunServer} from "./config/gundb";

const producer = new Producer();


// Fastify Instance
const PORT: number = 3000;
const HOST: string = "0.0.0.0" || "localhost";

const app = Fastify({
  logger: true,
});

app.register(socketioServer).ready(err => {
  if (err) throw err
  app.io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
      app.io.emit('chat message', msg);
    });

    socket.on("/sendfn", (msg) => {
      const { id, name, fn } = msg;
      (async () => {
        const data = await devDb.collection(name).find({ _id: new ObjectId(id) }).toArray()

        const functionObject = data[0].function.filter((item) => {
          return item.name == fn
        })

        const script = new VMScript(functionObject[0].fn);

        const result = vm.run(script)()
        app.io.emit("/sendfn", result)
      })()
    })

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
})

app.register(GunDb, {prefix: "v1/api/gun"})
app.register(Databases, { prefix: "v1/api/db" });
app.register(Blockchain, { prefix: "v1/api/blockchain" });

app.get('/test', async (req, res) => {
  const data = await readFile(join(__dirname, '/index.html'))
  res.header('content-type', 'text/html; charset=utf-8')
  res.send(data)
})



app.post("/v1/api/sendLog", async (req: FastifyRequest<{
  Body: {
    logType: string,
    message: string
  }
}>, res) => {
  const data = await producer.publishMessage(req.body.logType, req.body.message);
  res.send(data);
});



app.ready().then(() => {
  app.io.on("connection", (socket) => {
    console.log("user connected" + socket.id);
    socket.on("message", (data) => {
      console.log(data);
    });
  });
});

/**
 * Run the server!
 */

const start = async () => {
  try {

    await app.listen({ port: PORT, host: HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Amqp
ConsumeMessageInfo();
ConsumeMessageWarningAndError();
// Databases
main();
gunServer;
// Fastify
start();