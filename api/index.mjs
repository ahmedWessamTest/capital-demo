
import bootstrap from '../dist/e-commerce-rose/server/entry.mjs';
export default async function handler(req, res) {
  try {
    const response = await bootstrap(req);
    res.status(response.status).send(await response.text());
  } catch (err) {
    res.status(500).send(err.message);
  }
}