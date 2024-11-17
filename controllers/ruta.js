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

app.post("/usuarioRuta", async (req, res) => {
  try {
    const { idUsuario, rutas } = req.body;
    const usuario = await prisma.usuario.findUnique({
      where: { id: idUsuario },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const rutasCreadas = await Promise.all(
      rutas.map(async (ruta) => {
        const nuevaRuta = await prisma.ruta.create({
          data: {
            start: ruta.start,
            middle: ruta.middle,
            end: ruta.end,
            idTipoCaminata: ruta.IdTipoCaminata,
            fechaCreacion: new Date(),
            FechaModificacion: new Date(),
          },
        });

        await prisma.usuarioRuta.create({
          data: {
            idUsuario: idUsuario,
            IdRuta: nuevaRuta.id,
          },
        });

        return nuevaRuta;
      })
    );

    res
      .status(201)
      .json({ message: "Rutas creadas con éxito", rutas: rutasCreadas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear las rutas" });
  }
});

export default app;
