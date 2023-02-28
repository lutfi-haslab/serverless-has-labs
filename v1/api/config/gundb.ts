import Gun from 'gun';
// Gun Server
export const server = require('http').createServer().listen(8080);
export const gun = new Gun({
  web: server,
  file: 'v1/db',
});
