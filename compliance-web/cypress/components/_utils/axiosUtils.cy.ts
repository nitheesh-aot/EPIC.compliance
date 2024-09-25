/// <reference types="cypress" />

import { getUser } from "../../../src/utils/axiosUtils";
import axios, {  } from "axios";
import { User } from "oidc-client-ts";

describe("axiosUtils", () => {
  beforeEach(() => {
    // Reset session storage and axios defaults before each test
    sessionStorage.clear();
    axios.defaults.headers.common.Authorization = undefined;
  });

  describe("getUser", () => {
    it("should return null if no oidcStorage is found", () => {
      cy.stub(sessionStorage, "getItem").returns(null);
      expect(getUser()).to.be.null;
    });

    it("should return a User object if oidcStorage is found", () => {
      const oidcStorageMock = '{"access_token":"mockAccessToken"}';
      cy.stub(sessionStorage, "getItem").returns(oidcStorageMock);
      cy.stub(User, "fromStorageString").returns({
        access_token: "mockAccessToken",
      } as User);
      const user = getUser();
      expect(user).to.have.property("access_token", "mockAccessToken");
    });
  });

});
