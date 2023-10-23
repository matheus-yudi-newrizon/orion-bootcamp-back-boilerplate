import { Request, Response } from 'express';
import { UserService } from 'service/UserService';

/**
 * Controller for the user registration route.
 */
export class UserController {

  async signup(req: Request, res: Response) {
    try {
      const { email, password, confirmPassword } = req.body;
  
      const newUser = await UserService.createUser(email, password, confirmPassword);
  
      res.status(201).json({ message: 'Usuário criado com sucesso', user: newUser });
    } catch (error) {
      res.status(400).json({ error: 'Erro ao criar o usuário', details: error.message });
    }
  }

}

export default UserController;
