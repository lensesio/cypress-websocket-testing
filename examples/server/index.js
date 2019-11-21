const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  const loginReply = JSON.stringify({
    type: "CONNECTED",
  });

  ws.send(loginReply);

  ws.on('message', function incoming(m) {
    try {
      // Messages are stringified by default by rxjs
      const message = JSON.parse(m);

      const type = message && message.type;
      const data = message && message.data;

      switch (type) {
        case 'LOGIN':
          let reply = JSON.stringify({
            type: "RECORD",
            data: Math.round(Math.random() * 10)
          });
          ws.send(reply);
          reply = JSON.stringify({
            type: "END",
            data: "Bye, " + data + "!"
          });
          ws.send(reply);
          break;
        default:
          break;
      }
    } catch (error) {

    }
  });
});