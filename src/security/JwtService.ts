import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserResponseDTO } from '../dto/UserResponseDTO';
import { InvalidJwtTokenException } from '../exception/InvalidJwtTokenException';

export class JwtService {
  /**
   * Generates a JWT token with the provided data.
   *
   * @param data - Data to be included in the token.
   * @param secretKey - The secret key used in the sign method.
   * @param expiresIn - Token expiration time (e.g., '1h' for 1 hour).
   *
   * @returns The generated JWT token.
   */
  public static generateToken(data: UserResponseDTO, secretKey: string, expiresIn: string): string {
    return jwt.sign(data, secretKey, { expiresIn });
  }

  /**
   * Verifies and decodes a JWT token.
   *
   * @param token - JWT token to be verified.
   * @param secretKey - The secret key used in the sign method.
   *
   * @returns Decoded data from the token or null if the token is invalid.
   */
  public static verifyToken(token: string, secretKey: string): string | JwtPayload {
    try {
      return jwt.verify(token, secretKey);
    } catch (error) {
      throw new InvalidJwtTokenException(error.name, error.message);
    }
  }
}
