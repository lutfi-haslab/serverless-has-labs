import { VM, NodeVM, VMScript } from 'vm2'

const vm = new NodeVM({
  allowAsync: true,
  sandbox: {print: console.log},
  require: { external: true}
});


const script = new VMScript(`
const axios = require('axios');

module.exports = async function(){
  const user = await axios.get('https://jsonplaceholder.typicode.com/todos/1')
  print(user.data)
  return user.data
}
`);

const data = vm.run(script)

console.log(data())