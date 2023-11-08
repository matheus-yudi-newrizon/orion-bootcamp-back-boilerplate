import fs from 'fs';
import handlebars from 'handlebars';
import nodemailer, { SentMessageInfo, TestAccount, Transporter } from 'nodemailer';
import path from 'path';
import { Service } from 'typedi';
import { SendEmailFailException } from '../exception';

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
   * @throws {SendEmailFailException} if there is a failure sending email.
   */
  public static async sendEmail(email: string, subject: string, payload: unknown, template: string): Promise<void> {
    nodemailer.createTestAccount((error: Error, account: TestAccount) => {
      if (error) throw new SendEmailFailException(error.message);

      const transporter: Transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass
        }
      });

      const source: string = fs.readFileSync(path.join(__dirname, template), 'utf8');
      const compiledTemplate = handlebars.compile(source);

      const message = {
        from: account.user,
        to: email,
        subject: subject,
        html: compiledTemplate(payload)
      };

      transporter.sendMail(message, (error: Error, info: SentMessageInfo) => {
        if (error) throw new SendEmailFailException(error.message);

        console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
      });
    });
  }
}
