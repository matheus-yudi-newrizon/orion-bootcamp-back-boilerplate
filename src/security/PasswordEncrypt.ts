import bcrypt from 'bcrypt';

export class PasswordEncrypt {
  /**
   * Hashes a plain text password and returns the hashed password.
   *
   * @param password - The plain text password to be hashed.
   * @returns A promise that resolves with the hashed password.
   */
  public static async encrypt(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compares a plain text password with a hashed password to check if they match.
   *
   * @param password - The plain text password to be compared.
   * @param hashedPassword - The hashed password to compare with.
   * @returns A promise that resolves with a boolean indicating if the passwords match.
   */
  public static async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
