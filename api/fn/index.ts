import { PrismaClient } from "@prisma/client";
import tiny from "tiny-json-http";
import { apiRoute } from '../../utils';

const prisma = new PrismaClient();

type Data = {
  id: number,
  method: string,
  bodyFn: string,
}

const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
const dataJson: Data[] = [
  {
    id: 1,
    method: "GET",
    bodyFn: `
    const user = await prisma.user.findMany({})
    function test(){
      return "halo"
    }
    const data = test()
 
   return {
    data,
     id: 1,
     param: req.params,
     query: req.query,
     user
   }
   `
  },
  {
    id: 2,
    method: "POST",
    bodyFn: `
   const user = await prisma.user.create({
    data: {
      name: 'mnbvcxzl',
      email: 'lutfiikbalmajid5@prisma.io',
    },
  })

  return {
    id: 2,
		query: req.query,
    user
  }
  `
  },
  {
    id: 3,
    method: "POST",
    bodyFn: `
   const user = await prisma.user.create({
    data: {
      name: 'abcdefghijkl',
      email: 'abcdefghijkl@prisma.io',
    },
  })

  return user
  `
  },
  {
    id: 4,
    method: "GET",
    bodyFn: `
    const user = await tiny.get({url: 'https://jsonplaceholder.typicode.com/todos/1'})
    return user.body
  `
  },
];


apiRoute.get(async (req, res) => {
  try {
    const data = dataJson.filter(
      (item) => item.id == Number(req.query.id) && item.method == "GET"
    );
    const dataSend = new AsyncFunction("req", "res", "prisma", "tiny", data[0].bodyFn);
    await dataSend(req, res, prisma, tiny).then((data: any) => {
      return res.json(data);
    });
   
  } catch (err) {
    res.json(err)
  }
});

apiRoute.post(async (req, res) => {
  try {
    const data = dataJson.filter(
      (item) => item.id == Number(req.query.id) && item.method == "POST"
    );
    const dataSend = new AsyncFunction("req", "res", "prisma", data[0].bodyFn);
    await dataSend(req, res, prisma).then((data: any) => {
      return res.json(data);
    });
  } catch (err) {
    res.json(err)
  }
});

apiRoute.put((req, res) => {
  return res.json({ message: "PUT" });
});

export default apiRoute;