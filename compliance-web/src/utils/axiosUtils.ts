/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppConfig, OidcConfig } from "@/utils/config";
import axios, { AxiosError, AxiosInstance } from "axios";
import { User } from "oidc-client-ts";

export type OnErrorType = (error: AxiosError) => void;
export type OnSuccessType = (data: any) => void;

export function getUser() {
  const oidcStorage = sessionStorage.getItem(
    `oidc.user:${OidcConfig.authority}:${OidcConfig.client_id}`
  );
  if (!oidcStorage) {
    return null;
  }

  return User.fromStorageString(oidcStorage);
}

const onSuccess = (response: any) => response?.data ?? response.data;

const onError = (error: AxiosError) => {
  // optionaly catch errors and add additional logging here
  if (!error.response) {
    // CORS error or network error
    throw new Error("Network error or CORS issue");
  }
  throw error;
};

export function setAuthToken(client: AxiosInstance) {
  const user = getUser();
  if (user?.access_token) {
    client.defaults.headers.common.Authorization = `Bearer ${user?.access_token}`;
  } else {
    throw new Error("No access token!");
  }
}

export const request = ({ ...options }) => {
  const client = axios.create({ baseURL: AppConfig.apiUrl });
  setAuthToken(client);
  return client(options).then(onSuccess).catch(onError);
};

export const requestAuthAPI = ({ ...options }) => {
  const client = axios.create({ baseURL: AppConfig.authAPIUrl });
  setAuthToken(client);
  return client(options).then(onSuccess).catch(onError);
};
