import { ENDPOINTS } from './endpoints';
import httpClient from './httpClient';

export const getPolicies = (params) => httpClient.get(ENDPOINTS.POLICY.LIST, { params });

export const getPolicyDetail = (policyId) => httpClient.get(ENDPOINTS.POLICY.DETAIL(policyId));

export const getCardNews = () => httpClient.get(ENDPOINTS.POLICY.CARD_NEWS);

/** F-14: 설계서대로 검색어를 body의 query로 보낸다. */
export const getRecommendations = ({ keyword }) =>
  httpClient.post(ENDPOINTS.POLICY.RECOMMENDATIONS, { query: keyword });

export const getTerms = () => httpClient.get(ENDPOINTS.POLICY.TERMS);
