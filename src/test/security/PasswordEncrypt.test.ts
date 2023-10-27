import bcrypt from 'bcrypt';
import { PasswordEncrypt } from '../../security/PasswordEncrypt';

describe('PasswordEncrypt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('encrypt', () => {
    it('should encrypt password', async () => {
      const password = 'myPassword';

      const result = await PasswordEncrypt.encrypt(password);

      await expect(bcrypt.compare(password, result)).resolves.toBe(true);
    });
  });

  describe('compare', () => {
    it('should return true when passwords match', async () => {
      const password = 'myPassword';
      const hashedPassword = await PasswordEncrypt.encrypt(password);

      const result = await PasswordEncrypt.compare(password, hashedPassword);

      expect(result).toBe(true);
    });

    it('should return false when passwords match', async () => {
      const password = 'myPassword';
      const hashedPassword = await PasswordEncrypt.encrypt(password);

      const otherPassword = 'otherPassword';
      const result = await PasswordEncrypt.compare(otherPassword, hashedPassword);

      expect(result).toBe(false);
    });
  });
});
