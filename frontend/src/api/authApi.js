import { ENDPOINTS } from './endpoints';
import httpClient from './httpClient';

export const login = (credentials) => httpClient.post(ENDPOINTS.AUTH.LOGIN, credentials);

export const signup = (signupForm) => httpClient.post(ENDPOINTS.AUTH.SIGNUP, signupForm);

export const logout = () => httpClient.post(ENDPOINTS.AUTH.LOGOUT);

export const findEmail = (form) => httpClient.post(ENDPOINTS.AUTH.FIND_EMAIL, form);

export const resetPassword = (form) => httpClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, form);
