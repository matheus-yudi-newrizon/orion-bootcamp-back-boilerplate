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
    const transporters: Transporter[] = [
      nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      }),
      nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE_2,
        auth: {
          user: process.env.EMAIL_USERNAME_2,
          pass: process.env.EMAIL_PASSWORD_2
        }
      }),
      nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE_3,
        auth: {
          user: process.env.EMAIL_USERNAME_3,
          pass: process.env.EMAIL_PASSWORD_3
        }
      })
    ];

    const source: string = fs.readFileSync(path.join(__dirname, template), 'utf8');
    const compiledTemplate = handlebars.compile(source);

    const options = [
      {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: subject,
        html: compiledTemplate(payload)
      },
      {
        from: process.env.EMAIL_USERNAME_2,
        to: email,
        subject: subject,
        html: compiledTemplate(payload)
      },
      {
        from: process.env.EMAIL_USERNAME_3,
        to: email,
        subject: subject,
        html: compiledTemplate(payload)
      }
    ];

    transporters[0].verify().catch(error => {
      console.log(`${process.env.EMAIL_USERNAME} - ${error.message}`);
      transporters[1].verify().catch(error => {
        console.log(`${process.env.EMAIL_USERNAME_2} - ${error.message}`);
        transporters[2].verify().catch(error => {
          console.log(`${process.env.EMAIL_USERNAME_3} - ${error.message}`);
        });
      });
    });

    transporters[0].sendMail(options[0]).catch(error => {
      console.log(`${process.env.EMAIL_USERNAME} - ${error.message}`);
      transporters[1].sendMail(options[1]).catch(error => {
        console.log(`${process.env.EMAIL_USERNAME_2} - ${error.message}`);
        transporters[2].sendMail(options[2]).catch(error => {
          console.log(`${process.env.EMAIL_USERNAME_3} - ${error.message}`);
        });
      });
    });
  }
}
