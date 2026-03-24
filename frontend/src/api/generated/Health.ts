/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import { HealthResponse } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Health<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name HealthHealthGet
   * @summary Health
   * @request GET:/health
   */
  healthHealthGet = (params: RequestParams = {}) =>
    this.request<HealthResponse, any>({
      path: `/health`,
      method: "GET",
      format: "json",
      ...params,
    });
}
