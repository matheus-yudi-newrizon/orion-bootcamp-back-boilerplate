import { EmailNotValidException, PasswordMismatchException, PasswordNotValidException } from '../exception';

/**
 * Class for user request validation.
 */
export class UserRequestValidator {
  /**
   * Validates the pattern of an email address.
   *
   * @param email - The email address to be validated.
   * @throws {EmailNotValidException} - Throws an exception if the email is not in the correct pattern.
   */
  public static validateUserEmail(email: string): void {
    const emailPattern =
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

    if (!emailPattern.test(email)) {
      throw new EmailNotValidException();
    }
  }

  /**
   * Validates the strength of a user's password.
   *
   * @param password - The password to be validated.
   * @param confirmPassword - The confirm password to be validated.
   * @throws {PasswordNotValidException} - Throws an exception if the password does not meet security criteria.
   * @throws {PasswordMismatchException} - Throws an error if password and confirmPassword do not match.
   */
  public static validateUserPassword(password: string, confirmPassword: string): void {
    const passwordPattern = /^(?=.*[A-Z])(?=.*[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])(?!.* ).{8,}$/;

    if (!passwordPattern.test(password)) {
      throw new PasswordNotValidException();
    }

    if (password !== confirmPassword) {
      throw new PasswordMismatchException();
    }
  }
}
