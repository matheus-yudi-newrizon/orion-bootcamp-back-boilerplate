import bcrypt from 'bcrypt';
import { PasswordEncrypt } from '../../src/security/PasswordEncrypt';
import { Generate } from '../mocks/Generate';

const generate = new Generate();

describe('PasswordEncrypt', () => {
  describe('encrypt', () => {
    it('should encrypt the provided password', async () => {
      const { password } = generate.userPostRequest();
      const hashed = generate.hashedPassword();

      const spyHash = jest.spyOn(bcrypt, 'hash').mockImplementation(() => new Promise(resolve => resolve(hashed)));

      const result = await PasswordEncrypt.encrypt(password);
      expect(result).toBe(hashed);
      expect(spyHash).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('compare', () => {
    it('should return true if passwords match', async () => {
      const { password } = generate.userPostRequest();
      const hashed = generate.hashedPassword();

      const spyCompare = jest.spyOn(bcrypt, 'compare').mockImplementation(() => new Promise(resolve => resolve(true)));

      const result = await PasswordEncrypt.compare(password, hashed);
      expect(result).toBe(true);
      expect(spyCompare).toHaveBeenCalledWith(password, hashed);
    });

    it('should return false if passwords do not match', async () => {
      let { password } = generate.userPostRequest();
      password += 'foo.bar';
      const hashed = generate.hashedPassword();

      const spyCompare = jest.spyOn(bcrypt, 'compare').mockImplementation(() => new Promise(resolve => resolve(false)));

      const result = await PasswordEncrypt.compare(password, hashed);
      expect(result).toBe(false);
      expect(spyCompare).toHaveBeenCalledWith(password, hashed);
    });
  });
});
