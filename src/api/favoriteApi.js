import { ENDPOINTS } from './endpoints';
import httpClient from './httpClient';

export const getFavorites = (params) => httpClient.get(ENDPOINTS.FAVORITE.LIST, { params });

export const addFavorite = (policyId) => httpClient.post(ENDPOINTS.FAVORITE.DETAIL(policyId));

export const removeFavorite = (policyId) => httpClient.delete(ENDPOINTS.FAVORITE.DETAIL(policyId));

