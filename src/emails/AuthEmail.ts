import { transport } from "../config/nodemailer";

type EmailType = {
  Nombre: string;
  Correo: string;
  
  token: string;
};

export class AuthEmail {
  static sendConfirmationEmail = async (Usuario: EmailType) => {
    try {
      const email = await transport.sendMail({
        from: 'ActivSena_2025 <admin@activsena_2025.com>',
        to: Usuario.Correo,
        subject: 'ActivSena_2025 - Confirma tu cuenta',
        html: `
          <p>Hola: ${Usuario.Nombre}, has creado tu cuenta en ActivSena_2025, ¡ya casi está lista!</p>
          <p>Visita el siguiente enlace para confirmar tu cuenta:</p>
          <a href="#">Confirmar cuenta</a>
          <p>O ingresa el siguiente código de verificación: <strong>${Usuario.token}</strong></p>
        `
      });

      console.log(` Correo de confirmación enviado a ${Usuario.Correo}, ID del mensaje: ${email.messageId}`);
    } catch (error) {
      console.error(` Error al enviar correo a ${Usuario.Correo}:`, error);
    }
  }
  static sendContrasenaResetToken = async (Usuario: EmailType) => {
    try {
      const email = await transport.sendMail({
        from: 'ActivSena_2025 <admin@activsena_2025.com>',
        to: Usuario.Correo,
        subject: 'ActivSena_2025 - Restablece tu contraseña',
        html: `
          <p>Hola: ${Usuario.Nombre}, has solicitado restablecer tu contraseña</p>
          <p>Visita el siguiente enlace para confirmar tu cuenta:</p>
          <a href="#">Restablecer Contraseña</a>
          <p>O ingresa el siguiente código de verificación: <strong>${Usuario.token}</strong></p>
        `
      });

      console.log(` Correo de confirmación enviado a ${Usuario.Correo}, ID del mensaje: ${email.messageId}`);
    } catch (error) {
      console.error(` Error al enviar correo a ${Usuario.Correo}:`, error);
    }
}
}
