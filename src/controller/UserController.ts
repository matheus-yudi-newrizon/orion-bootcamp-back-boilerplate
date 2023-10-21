import { Request, Response } from 'express';
import { UserService } from '../service/UserService';
import { UserRequestValidator } from '../validation/UserRequestValidator';
import { RequiredFieldException } from '../exception/RequiredFieldException';

/**
 * Controller for the user registration route.
 */
export class UserController {
  async signup(req: Request, res: Response) {
    try {
      const { email, password, confirmPassword } = req.body;

      if (!email) throw new RequiredFieldException('email');
      if (!password) throw new RequiredFieldException('password');
      if (!confirmPassword) throw new RequiredFieldException('confirmPassword');

      UserRequestValidator.validateUserEmail(email);
      UserRequestValidator.validateUserPassword(password);
      UserRequestValidator.validateUserPasswordAndConfirmPassword(password, confirmPassword);

      const user = await UserService.createUser(email, password, confirmPassword);
      return res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default UserController;
