import jwt from 'jsonwebtoken';
import { UserResponseDTO } from '../dto/UserResponseDTO';

export class JwtService {
  private static readonly secretKey = 'secretKey';

  /**
   * Generates a JWT token with the provided data.
   *
   * @param data - Data to be included in the token.
   * @param expiresIn - Token expiration time (e.g., '1h' for 1 hour).
   * @returns The generated JWT token.
   */
  public static generateToken(data: UserResponseDTO, expiresIn?: string): string {
    if (expiresIn) {
      return jwt.sign(data, this.secretKey, { expiresIn });
    } else {
      return jwt.sign(data, this.secretKey);
    }
  }

  /**
   * Verifies and decodes a JWT token.
   *
   * @param token - JWT token to be verified.
   * @returns Decoded data from the token or null if the token is invalid.
   */
  public static verifyToken(token: string): UserResponseDTO | null {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      throw new Error(); // criar exception personalizada para esse erro
    }
  }
}
