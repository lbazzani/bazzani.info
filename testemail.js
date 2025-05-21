import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);

transporter.verify((error, success) => {
  if (error) {
    console.error("Errore nella configurazione SMTP:", error);
  } else {
    console.log("✅ Connessione SMTP riuscita!");
  }
});