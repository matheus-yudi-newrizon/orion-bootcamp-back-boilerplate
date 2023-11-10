import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';
import { UserResponseDTO } from '../../src/dto/UserResponseDTO';
import { InvalidJwtTokenException } from '../../src/exception/InvalidJwtTokenException';
import { JwtService } from '../../src/security/JwtService';
import { Generate } from '../mocks/Generate';

const generate = new Generate();

describe('JwtService', () => {
  const secretKey: string = process.env.JWT_SECRET_KEY;

  describe('generateToken', () => {
    it('should generate a JWT token with the provided data', () => {
      const jwtToken: string = generate.encodedJwt();
      const user: UserResponseDTO = generate.userPayload();
      const expiresIn: string = '5h';

      const spySign = jest.spyOn(jwt, 'sign').mockImplementation(() => jwtToken);

      const result = JwtService.generateToken(user, expiresIn);
      expect(result).toBe(jwtToken);
      expect(spySign).toHaveBeenCalledWith(user, secretKey, { expiresIn });
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a JWT token', () => {
      const jwtToken: string = generate.encodedJwt();
      const user: UserResponseDTO = generate.userPayload();

      const spyVerify = jest.spyOn(jwt, 'verify').mockImplementation(() => user);

      const result = JwtService.verifyToken(jwtToken);
      expect(result).toBe(user);
      expect(spyVerify).toHaveBeenCalledWith(jwtToken, secretKey);
    });

    it('should throw TokenExpiredError if the token is expired', () => {
      const jwtToken: string = generate.encodedJwt();

      const spyVerify = jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new TokenExpiredError('jwt expired', new Date());
      });

      expect(() => JwtService.verifyToken(jwtToken)).toThrow(InvalidJwtTokenException);
      expect(spyVerify).toHaveBeenCalledWith(jwtToken, secretKey);
    });

    it('should throw JsonWebTokenError if: invalid token, jwt malformed, jwt signature, invalid signature, jwt audience invalid, jwt issuer invalid, jwt id invalid, jwt subject invalid', () => {
      const jwtToken: string = generate.encodedJwt();

      const spyVerify = jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new JsonWebTokenError('invalid token');
      });

      expect(() => JwtService.verifyToken(jwtToken)).toThrow(InvalidJwtTokenException);
      expect(spyVerify).toHaveBeenCalledWith(jwtToken, secretKey);
    });

    it('should throw NotBeforeError if current time is before the nbf claim', () => {
      const jwtToken: string = generate.encodedJwt();

      const spyVerify = jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new NotBeforeError('jwt not active', new Date());
      });

      expect(() => JwtService.verifyToken(jwtToken)).toThrow(InvalidJwtTokenException);
      expect(spyVerify).toHaveBeenCalledWith(jwtToken, secretKey);
    });
  });
});
