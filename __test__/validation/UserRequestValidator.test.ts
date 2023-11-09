import { EmailNotValidException, PasswordMismatchException, PasswordNotValidException } from '../../src/exception';
import { UserRequestValidator } from '../../src/validation/UserRequestValidator';

describe('UserRequestValidator', () => {
  describe('validateUserEmail', () => {
    it('should not throw an exception for a valid email', () => {
      expect(() => UserRequestValidator.validateUserEmail('user@example.com')).not.toThrow();
    });

    it('should throw EmailNotValidException for an invalid email', () => {
      expect(() => UserRequestValidator.validateUserEmail('@example.com')).toThrow(EmailNotValidException);
    });

    it('should throw EmailNotValidException for an invalid email 2', () => {
      expect(() => UserRequestValidator.validateUserEmail('userexample.com')).toThrow(EmailNotValidException);
    });

    it('should throw EmailNotValidException for an invalid email 3', () => {
      expect(() => UserRequestValidator.validateUserEmail('user@.com')).toThrow(EmailNotValidException);
    });

    it('should throw EmailNotValidException for an invalid email 4', () => {
      expect(() => UserRequestValidator.validateUserEmail('user@examplecom')).toThrow(EmailNotValidException);
    });
  });

  describe('validateUserPassword', () => {
    it('should not throw an exception for a valid password and matching confirmation', () => {
      expect(() => UserRequestValidator.validateUserPassword('P@ssw0rd', 'P@ssw0rd')).not.toThrow();
    });

    it('should throw PasswordMismatchException for non-matching passwords', () => {
      expect(() => UserRequestValidator.validateUserPassword('P@ssw0rd', 'DifferentP@ssw0rd')).toThrow(PasswordMismatchException);
    });

    it('should throw PasswordNotValidException for an invalid password', () => {
      expect(() => UserRequestValidator.validateUserPassword('invalid', 'invalid')).toThrow(PasswordNotValidException);
    });

    it('should throw PasswordNotValidException for a password without an uppercase letter', () => {
      expect(() => UserRequestValidator.validateUserPassword('p@ssw0rd', 'p@ssw0rd')).toThrow(PasswordNotValidException);
    });

    it('should throw PasswordNotValidException for a password without a special character', () => {
      expect(() => UserRequestValidator.validateUserPassword('Passw0rd', 'Passw0rd')).toThrow(PasswordNotValidException);
    });
  });
});
