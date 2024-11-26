import express from "express";
import { PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();

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
app.post("/usuario", async (req, res) => {
  try {
    const usuario = await prisma.usuario.create({
      data: req.body,
    });
    res.json({
      data: usuario,
      message: "usuario creado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al agregar usuario",
      error: error.message,
    });
  }
});
app.put("/usuario/:id", async (req, res) => {
  try {
    const usuario = await prisma.usuario.update({
      where: {
        id: Number(req.params.id),
      },
      data: req.body,
    });
    res.json({
      data: usuario,
      message: "usuario actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al editar usuario",
      error: error.message,
    });
  }
});
app.delete("/usuario/:id", async (req, res) => {
  try {
    const usuario = await prisma.usuario.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      data: usuario,
      message: "usuario eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar usuario",
      error: error.message,
    });
  }
});
app.get("/usuario/:id", async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      data: usuario,
      message: "usuario obtenido correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
});

app.post("/login", async (req, res) => {
  const { usuario, password } = req.body;

  const login = await prisma.usuario.findFirst({
    where: {
      usuario: usuario,
      password: password,
    },
    include: {
      UsuarioRuta: {
        include: {
          ruta: true,
        },
      },
    },
  });

  if (!login) {
    res.json({
      message: "Usuario no autorizado",
      error: "Usuario no autorizado",
    });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rutasHoy = login.UsuarioRuta.filter((usuarioRuta) => {
    const rutaFecha = new Date(usuarioRuta.ruta.fechaCreacion);
    rutaFecha.setHours(0, 0, 0, 0);
    return rutaFecha.getTime() === today.getTime();
  });

  const response = {
    nombre: login.nombre,
    idUsuario: login.id,
    usuario: login.usuario,
    contrasena: login.password, // Puedes eliminar esta línea si no deseas mostrar la contraseña
    rutas: rutasHoy.map((usuarioRuta) => ({
      id: usuarioRuta.ruta.id,
      start: usuarioRuta.ruta.start,
      middle: usuarioRuta.ruta.middle,
      end: usuarioRuta.ruta.end,
    })),
  };

  if (rutasHoy.length === 0) {
    res.json({
      message: "Hoy no tiene rutas asignadas",
      data: response,
    });
  } else {
    res.json({
      message: "Inicio de sesión correcto",
      data: response,
    });
  }
});
app.post("/usuarioRuta", async (req, res) => {
  const { idUsuario, rutas } = req.body;

  if (!idUsuario || !Array.isArray(rutas) || rutas.length === 0) {
    return res.status(400).json({
      message: "Faltan datos requeridos o el formato no es válido.",
    });
  }

  try {
    // Verificar si el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: idUsuario },
    });

    if (!usuarioExistente) {
      return res.status(400).json({
        message: `El usuario con id ${idUsuario} no existe.`,
      });
    }

    // Crear rutas
    const rutasCreadaIds = await Promise.all(
      rutas.map(async (ruta) => {
        const {
          start,
          middle,
          end,
          IdTipoCaminata, // Ajustado para que coincida con los datos enviados
          linea = null,
        } = ruta;

        if (!start || !middle || !end || !IdTipoCaminata) {
          throw new Error("Datos incompletos en una de las rutas.");
        }

        const nuevaRuta = await prisma.ruta.create({
          data: {
            start,
            middle,
            end,
            idTipoCaminata: IdTipoCaminata,
            linea,
            fechaCreacion: new Date(),
            FechaModificacion: new Date(),
          },
        });

        return nuevaRuta.id; // Retornar el ID de la ruta creada
      })
    );

    // Crear relaciones UsuarioRuta
    await Promise.all(
      rutasCreadaIds.map(async (idRuta) => {
        await prisma.usuarioRuta.create({
          data: {
            idUsuario,
            IdRuta: idRuta,
          },
        });
      })
    );

    return res.status(201).json({
      message: "Rutas y relaciones guardadas correctamente.",
    });
  } catch (error) {
    console.error("Error al guardar rutas:", error);
    return res.status(500).json({
      message: "Ocurrió un error al guardar las rutas.",
      error: error.message,
    });
  }
});
export default app;
