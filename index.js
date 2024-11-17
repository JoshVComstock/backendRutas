import express from "express";
import cors from "cors";

import usuario from "./controllers/usuario.js";
import ruta from "./controllers/ruta.js";
import tipoCaminata from "./controllers/tipocaminata.js";
const app = express();
const port = 3000;
import bodyParser from "body-parser";
app.use(cors({ origin: "*" }));
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.use(tipoCaminata);
app.use(usuario);
app.use(ruta);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
