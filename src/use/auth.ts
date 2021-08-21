import { IonicAuth } from '@ionic-enterprise/auth';
import useAuthConfig from './auth-config';

class AuthenticationService extends IonicAuth {
  constructor() {
    const { config } = useAuthConfig();
    super(config);
  }
}

const authService = new AuthenticationService();

export default () => {
  return {
    login: (): Promise<void> => authService.login(),
    logout: (): Promise<void> => authService.logout(),
  };
};
