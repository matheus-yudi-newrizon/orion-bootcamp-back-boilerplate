import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserResponseDTO } from '../dto/UserResponseDTO';
import { InvalidJwtTokenException } from '../exception/InvalidJwtTokenException';

export class JwtService {
  private static readonly secretKey = process.env.JWT_SECRET_KEY;

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
  public static verifyToken(token: string): string | JwtPayload {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      throw new InvalidJwtTokenException(error.name, error.message);
    }
  }
}
