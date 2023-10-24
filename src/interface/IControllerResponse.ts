export interface IControllerResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
