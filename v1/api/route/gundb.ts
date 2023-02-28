import { gun } from "../config/gundb";

export const GunDb = async (app, opt, done) => {
  app.get('/:key', async (req, res) => {

    gun.get(req.params.key).on(function (val) {
      return res.send(val)
    })

    
  })

  app.post('/:key', async (req, res) => {
    gun.get(req.params.key).put(req.body, (ack) => {
      if (!ack) res.send({ status: 'Error' })
      res.send({ status: 'ok' })
    })
  })
  done();
}