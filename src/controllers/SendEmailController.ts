import { Request, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (req: Request, res: Response): Promise<void> => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ msg: "Todos los campos son obligatorios" });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: `"ActivSena Contacto" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_DESTINO || process.env.EMAIL_USER, 
      subject: `Nuevo mensaje de contacto - ${name}`,
      text: `
Nombre: ${name}
Correo: ${email}
Mensaje: ${message}
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: "Mensaje enviado correctamente " });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    res.status(500).json({ msg: "Error al enviar el correo " });
  }
};
