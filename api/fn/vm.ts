import { VercelRequest, VercelResponse } from "@vercel/node";
import nextConnect from 'next-connect';
import { NodeVM, VMScript } from 'vm2';

const apiRoute = nextConnect({
  onError(error, req: VercelRequest, res: VercelResponse) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.get(async (req, res) => {
  const vm = new NodeVM({
    allowAsync: true,
    sandbox: { print: console.log, req: req, res: res },
    require: { external: true }
  });

  try {
    const script = new VMScript(`
    const axios = require('axios');
    
    module.exports = async function(){
      const user = await axios.get('https://jsonplaceholder.typicode.com/todos/1')
      print(user.data)
      return user.data
    }
    `);

    const data = vm.run(script)
    res.json(await data())

  } catch (err) {
    res.json(err)
  }
});

export default apiRoute;