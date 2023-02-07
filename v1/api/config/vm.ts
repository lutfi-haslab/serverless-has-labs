import { NodeVM } from 'vm2';
export { VMScript } from 'vm2'
// VM2 Instance
export const vm = new NodeVM({
  allowAsync: true,
  sandbox: { print: console.log },
  require: { external: true }
});