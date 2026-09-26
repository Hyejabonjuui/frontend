import { ENDPOINTS } from './endpoints';
import httpClient from './httpClient';

/** F-03: 조건 등록 화면의 선택지를 한 번에 받아온다. */
export const getCodes = () => httpClient.get(ENDPOINTS.CODE.LIST);
