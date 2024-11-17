import express from "express";
import { PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();

app.get("/tipoCaminata", async (req, res) => {
  try {
    const caminata = await prisma.tipoCaminata.findMany({});
    res.json({
      data: caminata,
      message: "Tipo caminata obtenidos correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
});

export default app;
