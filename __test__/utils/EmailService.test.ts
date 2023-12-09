import fs from 'fs';
import handlebars from 'handlebars';
import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';
import { EmailService } from '../../src/utils/EmailService';
import { Generate } from '../mocks/Generate';

const generate = new Generate();

describe('EmailService', () => {
  describe('sendEmail', () => {
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
