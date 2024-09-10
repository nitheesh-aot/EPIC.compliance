/* eslint-disable @typescript-eslint/no-explicit-any */
import { notify } from "@/store/snackbarStore";
import { AppConfig, OidcConfig } from "@/utils/config";
import axios, { AxiosError, AxiosInstance } from "axios";
import { User } from "oidc-client-ts";
import { CORS_ERROR_MSG } from "./constants";

export type OnErrorType = (error: AxiosError) => void;
export type OnSuccessType = (data: any) => void;

type ErrorResponseData = {
  message: string;
};

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
    notify.error(CORS_ERROR_MSG);
    throw new Error(CORS_ERROR_MSG);
  } else {
    notify.error(
      (error.response?.data as ErrorResponseData)?.message ??
        error.message ??
        "API Error!"
    );
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

export const requestTrackAPI = ({ ...options }) => {
  const client = axios.create({ baseURL: AppConfig.trackAPIUrl });
  setAuthToken(client);
  return client(options).then(onSuccess).catch(onError);
};
