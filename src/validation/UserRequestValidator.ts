import { PasswordNotValidException } from '../exception/PasswordNotValidException';
import { EmailNotValidException } from '../exception/EmailNotValidException';
import { PasswordMismatchException } from 'exception/PasswordMismatchException';
/**
 * Class for user request validation.
 */
export class UserRequestValidator {
  /**
   * Validates the format of an email address.
   * @param email - The email address to be validated.
   * @throws {EmailNotValidException} - Throws an exception if the email is not in the correct format.
   */
  public static validateUserEmail(email: string): void {
    const emailPattern = /^[A-Za-z0-9.%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$/;
    if (!emailPattern.test(email)) {
      throw new EmailNotValidException();
    }
  }

  /**
   * Validates the strength of a user's password.
   * @param password - The password to be validated.
   * @throws {PasswordNotValidException} - Throws an exception if the password does not meet security criteria.
   *  @throws {Error} - Throws an error if the passwords do not match.
   */
  public static validateUserPassword(password: string, confirmPassword: string): void {
    const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,}$/;

    if (!passwordPattern.test(password)) {
      throw new PasswordNotValidException();
    }

    if (password !== confirmPassword) {
      throw new PasswordMismatchException();
    }
  }
}
