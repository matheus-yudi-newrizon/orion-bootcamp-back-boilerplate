import { UserResponseDTO } from '../../src/dto/UserResponseDTO';

/**
 * Generates a mock of user input.
 *
 * @returns An object with the mocked data.
 */
export const userInput = () => {
  return { email: 'orion@email.com', password: '12345678aA!', confirmPassword: '12345678aA!' };
};

/**
 * Generates a mock of user post request.
 *
 * @returns A UserPostRequestDTO with the mocked data.
 */
export const userPostRequest = () => {
  return { email: 'orion@email.com', password: '12345678aA!' };
};

/**
 * Generates a mock of user payload.
 *
 * @returns A UserResponseDTO with the mocked data.
 */
export const userPayload = () => {
  return new UserResponseDTO({ id: 1, email: 'orion@email.com', password: '12345678aA!' });
};
