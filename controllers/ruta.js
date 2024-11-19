import express from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();

const getStreetFromCoordinates = async (lat, long) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`
    );
    const address = response.data?.address?.road || "Unknown"; // Obtener el nombre de la calle
    return address;
  } catch (error) {
    console.error("Error al obtener el nombre de la calle:", error);
    return "Unknown";
  }
};

app.get("/rutaRecoridas", async (req, res) => {
  try {
    // Obtener usuarios con sus rutas
    const usuarios = await prisma.usuario.findMany({
      include: {
        UsuarioRuta: {
          include: {
            ruta: true, // Incluir la relación de ruta
          },
        },
      },
    });

    const streetCount = {};

    const usuariosConRutas = await Promise.all(
      usuarios.map(async (usuario) => {
        const rutasConCalles = await Promise.all(
          usuario.UsuarioRuta.map(async (usuarioRuta) => {
            const { start, middle, end } = usuarioRuta.ruta;

            const startStreet = await getStreetFromCoordinates(
              start[0],
              start[1]
            );
            const middleStreet = await getStreetFromCoordinates(
              middle[0],
              middle[1]
            );
            const endStreet = await getStreetFromCoordinates(end[0], end[1]);

            [startStreet, middleStreet, endStreet].forEach((street) => {
              streetCount[street] = (streetCount[street] || 0) + 1;
            });
          })
        );
      })
    );

    const mostWalkedStreets = Object.entries(streetCount)
      .map(([street, count]) => ({ street, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      data: mostWalkedStreets,
      message: "Usuarios y rutas obtenidos correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener usuarios y rutas",
      error: error.message,
    });
  }
});

app.get("/usuario", async (req, res) => {
  try {
    const usuario = await prisma.usuario.findMany({});
    res.json({
      data: usuario,
      message: "usuarios obtenidos correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
});
app.post("/tipoCaminata", async (req, res) => {
  try {
    const camata = await prisma.tipoCaminata.create({
      data: req.body,
    });
    res.json({
      data: camata,
      message: "Tipo caminata creada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener tipo caminata",
      error: error.message,
    });
  }
});

app.get("/allRutas", async (req, res) => {
  try {
    const rutas = await prisma.ruta.findMany({
      select: {
        start: true,
        middle: true,
        end: true,
      },
    });

    res
      .status(200)
      .json({ message: "Rutas obtenidas correctamente", data: rutas });
  } catch (error) {
    console.error("Error al obtener las rutas:", error);
    res.status(500).json({ error: "Error al obtener las rutas" });
  }
});
app.get("/tipoCaminata/:id/rutas", async (req, res) => {
  const { id } = req.params;

  try {
    const tipoCaminata = await prisma.tipoCaminata.findUnique({
      where: {
        id: parseInt(id, 10),
      },
      include: {
        Ruta: {
          select: {
            id: true,
            start: true,
            middle: true,
            end: true,
            linea: true,
          },
        },
      },
    });

    if (!tipoCaminata) {
      return res.status(404).json({ message: "TipoCaminata no encontrado" });
    }

    res.status(200).json({
      message: "Rutas obtenidas correctamente",
      data: tipoCaminata.Ruta,
    });
  } catch (error) {
    console.error("Error al obtener las rutas del TipoCaminata:", error);
    res
      .status(500)
      .json({ error: "Error al obtener las rutas del TipoCaminata" });
  }
});

app.get("/usuario", async (req, res) => {
  try {
    const usuario = await prisma.usuario.findMany({});
    res.json({
      data: usuario,
      message: "usuarios obtenidos correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
});
export default app;
