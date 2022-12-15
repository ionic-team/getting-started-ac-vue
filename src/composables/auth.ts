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
  const getUserName = async (): Promise<string | undefined> => {
    const token = await authService.getIdToken();
    return token && token.name;
  };

  return {
    getUserName,
    isAuthenticated: (): Promise<boolean> => authService.isAuthenticated(),
    login: (): Promise<void> => authService.login(),
    logout: (): Promise<void> => authService.logout(),
  };
};
