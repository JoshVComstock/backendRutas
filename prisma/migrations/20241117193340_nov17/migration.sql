-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioRuta" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "IdRuta" INTEGER NOT NULL,

    CONSTRAINT "UsuarioRuta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ruta" (
    "id" SERIAL NOT NULL,
    "start" DOUBLE PRECISION[],
    "middle" DOUBLE PRECISION[],
    "end" DOUBLE PRECISION[],
    "idTipoCaminata" INTEGER NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL,
    "FechaModificacion" TIMESTAMP(3) NOT NULL,
    "linea" TEXT,

    CONSTRAINT "Ruta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoCaminata" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "TipoCaminata_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UsuarioRuta" ADD CONSTRAINT "UsuarioRuta_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioRuta" ADD CONSTRAINT "UsuarioRuta_IdRuta_fkey" FOREIGN KEY ("IdRuta") REFERENCES "Ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruta" ADD CONSTRAINT "Ruta_idTipoCaminata_fkey" FOREIGN KEY ("idTipoCaminata") REFERENCES "TipoCaminata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
