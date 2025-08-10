import { Usuario } from "../models/Usuario";
import { hashPassword } from "../utils/auth";
import { db } from "../config/db";

(async () => {
  try {
    await db.sync(); // sincroniza por si las moscas

    const admin = await Usuario.create({
      IdentificacionUsuario: "admin001",
      Nombre: "Alexjh Admin",
      Apellido: "Sistema",
      Correo: "admin@example.com",
      Telefono: "3000000000",
      Contrasena: await hashPassword("alexjhoan117"),
      FechaRegistro: new Date(),
      token: "",
      confirmed: true,
      IdRol: 1, // ADMINISTRADOR
    });

    const instructor = await Usuario.create({
      IdentificacionUsuario: "instruc001",
      Nombre: "Maria Instructora",
      Apellido: "SENA",
      Correo: "instructor@example.com",
      Telefono: "3100000000",
      Contrasena: await hashPassword("instructor123"),
      FechaRegistro: new Date(),
      token: "",
      confirmed: true,
      IdRol: 3, // INSTRUCTOR
    });

    console.log("Usuarios creados:");
    console.log(" Admin:", admin.IdUsuario);
    console.log(" Instructor:", instructor.IdUsuario);

    process.exit();
  } catch (err) {
    console.error(" Error al crear usuarios", err);
    process.exit(1);
  }
})();
