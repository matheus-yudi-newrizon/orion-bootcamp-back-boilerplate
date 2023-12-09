import fs from 'fs';
import handlebars from 'handlebars';
import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer';
import path from 'path';
import { Service } from 'typedi';

/**
 * Class for email service actions.
 */
@Service()
export class EmailService {
  /**
   * Sends a personalized email.
   *
   * @param email - The email recipient.
   * @param subject - The subject of the email.
   * @param payload - The payload object with user data.
   * @param template - The path to a HTML template handlebars.
   *
   * @returns A promise that resolves with void.
   */
  public static async sendEmail(email: string, subject: string, payload: unknown, template: string): Promise<void> {
    const transporter: Transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const source: string = fs.readFileSync(path.join(__dirname, template), 'utf8');
    const compiledTemplate = handlebars.compile(source);

    const options = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: subject,
      html: compiledTemplate(payload)
    };

    transporter.verify(function (error: Error) {
      if (error) console.log(error.message);
    });

    transporter.sendMail(options, (error: Error, info: SentMessageInfo) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log('Message sent: ' + info.messageId);
      }
    });
  }
}
