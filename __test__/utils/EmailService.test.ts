import fs from 'fs';
import handlebars from 'handlebars';
import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';
import { Generate } from '../mocks/Generate';
import { EmailService } from '../../src/utils/EmailService';
import { SendEmailFailException } from '../../src/exception';

const generate = new Generate();

describe('EmailService', () => {
  describe('sendEmail', () => {
    it('should send a personalized email', async () => {
      const email = generate.userData().email;
      const payload = { username: email.slice(0, email.indexOf('@')), link: 'https://www.example.com' };
      const template = './path/to/thing';

      const transporter: Partial<Transporter> = {
        verify: jest.fn(),
        sendMail: jest.fn()
      };
      const source: string = '';
      const compiledTemplate = jest.fn();

      const spyCreateTransport = jest.spyOn(nodemailer, 'createTransport').mockReturnValue(transporter as Transporter);
      const spyJoin = jest.spyOn(path, 'join').mockReturnValue(template);
      const spyReadFile = jest.spyOn(fs, 'readFileSync').mockReturnValue(source);
      const spyCompile = jest.spyOn(handlebars, 'compile').mockReturnValue(compiledTemplate);

      await EmailService.sendEmail(email, 'Test Email', payload, template);

      expect(spyCreateTransport).toHaveBeenCalledWith({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      expect(spyJoin).toHaveBeenCalledWith(process.cwd() + '/src/utils', template);
      expect(spyReadFile).toHaveBeenCalledWith(template, 'utf8');
      expect(spyCompile).toHaveBeenCalledWith(source);
      expect(compiledTemplate).toHaveBeenCalledWith(payload);
      expect(transporter.verify).toHaveBeenCalled();
      expect(transporter.sendMail).toHaveBeenCalled();
    });

    it('should throw SendEmailFailException if fails sending email', async () => {
      const email = generate.userData().email;
      const payload = { username: email.slice(0, email.indexOf('@')), link: 'https://www.example.com' };
      const template = './path/to/thing';

      const transporter: Partial<Transporter> = {
        verify: jest.fn(),
        sendMail: jest.fn().mockImplementation(() => {
          throw new SendEmailFailException('Failed.');
        })
      };
      const source: string = '';
      const compiledTemplate = jest.fn();

      const spyCreateTransport = jest.spyOn(nodemailer, 'createTransport').mockReturnValue(transporter as Transporter);
      const spyJoin = jest.spyOn(path, 'join').mockReturnValue(template);
      const spyReadFile = jest.spyOn(fs, 'readFileSync').mockReturnValue(source);
      const spyCompile = jest.spyOn(handlebars, 'compile').mockReturnValue(compiledTemplate);

      await expect(EmailService.sendEmail(email, 'Test Email', payload, template)).rejects.toThrow(SendEmailFailException);
      expect(spyCreateTransport).toHaveBeenCalledWith({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      expect(spyJoin).toHaveBeenCalledWith(process.cwd() + '/src/utils', template);
      expect(spyReadFile).toHaveBeenCalledWith(template, 'utf8');
      expect(spyCompile).toHaveBeenCalledWith(source);
      expect(compiledTemplate).toHaveBeenCalledWith(payload);
      expect(transporter.verify).toHaveBeenCalled();
      expect(transporter.sendMail).toHaveBeenCalled();
    });

    it('should throw SendEmailFailException if fails verifying email', async () => {
      const email = generate.userData().email;
      const payload = { username: email.slice(0, email.indexOf('@')), link: 'https://www.example.com' };
      const template = './path/to/thing';

      const transporter: Partial<Transporter> = {
        verify: jest.fn().mockImplementation(() => {
          throw new SendEmailFailException('Failed.');
        })
      };
      const source: string = '';
      const compiledTemplate = jest.fn();

      const spyCreateTransport = jest.spyOn(nodemailer, 'createTransport').mockReturnValue(transporter as Transporter);
      const spyJoin = jest.spyOn(path, 'join').mockReturnValue(template);
      const spyReadFile = jest.spyOn(fs, 'readFileSync').mockReturnValue(source);
      const spyCompile = jest.spyOn(handlebars, 'compile').mockReturnValue(compiledTemplate);

      await expect(EmailService.sendEmail(email, 'Test Email', payload, template)).rejects.toThrow(SendEmailFailException);
      expect(spyCreateTransport).toHaveBeenCalledWith({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      expect(spyJoin).toHaveBeenCalledWith(process.cwd() + '/src/utils', template);
      expect(spyReadFile).toHaveBeenCalledWith(template, 'utf8');
      expect(spyCompile).toHaveBeenCalledWith(source);
      expect(compiledTemplate).toHaveBeenCalledWith(payload);
      expect(transporter.verify).toHaveBeenCalled();
    });

    it('should throw Error if compiledTemplate fails', async () => {
      const email = generate.userData().email;
      const payload = { username: email.slice(0, email.indexOf('@')), link: 'https://www.example.com' };
      const template = './path/to/thing';

      const transporter: Partial<Transporter> = {};
      const source: string = '';
      const compiledTemplate = jest.fn().mockImplementation(() => {
        throw new Error('Failed.');
      });

      const spyCreateTransport = jest.spyOn(nodemailer, 'createTransport').mockReturnValue(transporter as Transporter);
      const spyJoin = jest.spyOn(path, 'join').mockReturnValue(template);
      const spyReadFile = jest.spyOn(fs, 'readFileSync').mockReturnValue(source);
      const spyCompile = jest.spyOn(handlebars, 'compile').mockReturnValue(compiledTemplate);

      await expect(EmailService.sendEmail(email, 'Test Email', payload, template)).rejects.toThrow(Error);
      expect(spyCreateTransport).toHaveBeenCalledWith({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      expect(spyJoin).toHaveBeenCalledWith(process.cwd() + '/src/utils', template);
      expect(spyReadFile).toHaveBeenCalledWith(template, 'utf8');
      expect(spyCompile).toHaveBeenCalledWith(source);
      expect(compiledTemplate).toHaveBeenCalledWith(payload);
    });

    it('should throw Error if handlebars fails compiling source', async () => {
      const email = generate.userData().email;
      const payload = { username: email.slice(0, email.indexOf('@')), link: 'https://www.example.com' };
      const template = './path/to/thing';

      const transporter: Partial<Transporter> = {};
      const source: string = '';

      const spyCreateTransport = jest.spyOn(nodemailer, 'createTransport').mockReturnValue(transporter as Transporter);
      const spyJoin = jest.spyOn(path, 'join').mockReturnValue(template);
      const spyReadFile = jest.spyOn(fs, 'readFileSync').mockReturnValue(source);
      const spyCompile = jest.spyOn(handlebars, 'compile').mockImplementation(() => {
        throw new Error('Failed.');
      });

      await expect(EmailService.sendEmail(email, 'Test Email', payload, template)).rejects.toThrow(Error);
      expect(spyCreateTransport).toHaveBeenCalledWith({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      expect(spyJoin).toHaveBeenCalledWith(process.cwd() + '/src/utils', template);
      expect(spyReadFile).toHaveBeenCalledWith(template, 'utf8');
      expect(spyCompile).toHaveBeenCalledWith(source);
    });

    it('should throw Error if readFileSync fails', async () => {
      const email = generate.userData().email;
      const payload = { username: email.slice(0, email.indexOf('@')), link: 'https://www.example.com' };
      const template = './path/to/thing';

      const transporter: Partial<Transporter> = {};

      const spyCreateTransport = jest.spyOn(nodemailer, 'createTransport').mockReturnValue(transporter as Transporter);
      const spyJoin = jest.spyOn(path, 'join').mockReturnValue(template);
      const spyReadFile = jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('Failed.');
      });

      await expect(EmailService.sendEmail(email, 'Test Email', payload, template)).rejects.toThrow(Error);
      expect(spyCreateTransport).toHaveBeenCalledWith({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      expect(spyJoin).toHaveBeenCalledWith(process.cwd() + '/src/utils', template);
      expect(spyReadFile).toHaveBeenCalledWith(template, 'utf8');
    });

    it('should throw TypeError if join fails', async () => {
      const email = generate.userData().email;
      const payload = { username: email.slice(0, email.indexOf('@')), link: 'https://www.example.com' };
      const template = './path/to/thing';

      const transporter: Partial<Transporter> = {};

      const spyCreateTransport = jest.spyOn(nodemailer, 'createTransport').mockReturnValue(transporter as Transporter);
      const spyJoin = jest.spyOn(path, 'join').mockImplementation(() => {
        throw new TypeError('Failed.');
      });

      await expect(EmailService.sendEmail(email, 'Test Email', payload, template)).rejects.toThrow(TypeError);
      expect(spyCreateTransport).toHaveBeenCalledWith({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      expect(spyJoin).toHaveBeenCalledWith(process.cwd() + '/src/utils', template);
    });

    it('should throw Error if createTransport fails', async () => {
      const email = generate.userData().email;
      const payload = { username: email.slice(0, email.indexOf('@')), link: 'https://www.example.com' };
      const template = './path/to/thing';

      const spyCreateTransport = jest.spyOn(nodemailer, 'createTransport').mockImplementation(() => {
        throw new Error('Failed.');
      });

      await expect(EmailService.sendEmail(email, 'Test Email', payload, template)).rejects.toThrow(Error);
      expect(spyCreateTransport).toHaveBeenCalledWith({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    });
  });
});
