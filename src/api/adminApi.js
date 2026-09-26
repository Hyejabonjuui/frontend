import { ENDPOINTS } from './endpoints';
import httpClient from './httpClient';

export const startPolicyCollection = () => httpClient.post(ENDPOINTS.ADMIN.COLLECT);

export const getPolicyCollectionStatus = () => httpClient.get(ENDPOINTS.ADMIN.COLLECT_STATUS);
