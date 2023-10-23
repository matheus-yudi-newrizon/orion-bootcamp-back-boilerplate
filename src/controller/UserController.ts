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
  
      res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ error: 'Request processing error.', details: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error.' });
      }
    }
    
  }

}

export default UserController;
