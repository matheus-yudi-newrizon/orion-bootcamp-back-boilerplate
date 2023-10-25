import { Request, Response } from 'express';
import { UserService } from '../service/UserService';
import { UserRequestValidator } from '../validation/UserRequestValidator';
import { RequiredFieldException } from '../exception/RequiredFieldException';
import { BusinessException } from '../exception/BusinessException';
import { UserResponseDTO } from '../dto/UserResponseDTO';

interface IControllerResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export class UsuarioController {
  public static async createUser(req: Request, res: Response) {
    try {
      const { email, password, confirmPassword } = req.body;

      if (!email) throw new RequiredFieldException('email');
      if (!password) throw new RequiredFieldException('password');
      if (!confirmPassword) throw new RequiredFieldException('confirmPassword');

      UserRequestValidator.validateUserEmail(email);
      UserRequestValidator.validateUserPassword(password, confirmPassword);

      const user = await UserService.createUser(email, password);
      const response: IControllerResponse<UserResponseDTO> = { success: true, data: user };
      return res.status(201).json(response);
    } catch (error) {
      if (error instanceof BusinessException) {
        const response: IControllerResponse<null> = { success: false, message: error.message };
        return res.status(error.status).json(response);
      } else {
        const response: IControllerResponse<null> = { success: false, message: 'Internal server error.' };
        return res.status(500).json(response);
      }
    }
  }
}
