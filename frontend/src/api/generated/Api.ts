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

import {
  AdminTestResponse,
  HTTPValidationError,
  ListingCreate,
  ListingResponse,
  ListingUpdate,
  ListingsResponse,
  MeResponse,
  ProfileResponse,
  ProfileUpdate,
  SettingsResponse,
  SettingsUpdate,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Api<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags admin
   * @name AdminTestApiV1AdminTestGet
   * @summary Admin Test
   * @request GET:/api/v1/admin/test
   */
  adminTestApiV1AdminTestGet = (params: RequestParams = {}) =>
    this.request<AdminTestResponse, HTTPValidationError>({
      path: `/api/v1/admin/test`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name MeApiV1MeGet
   * @summary Me
   * @request GET:/api/v1/me
   */
  meApiV1MeGet = (params: RequestParams = {}) =>
    this.request<MeResponse, HTTPValidationError>({
      path: `/api/v1/me`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags profile
   * @name GetProfileApiV1ProfileGet
   * @summary Get Profile
   * @request GET:/api/v1/profile/
   */
  getProfileApiV1ProfileGet = (params: RequestParams = {}) =>
    this.request<ProfileResponse, any>({
      path: `/api/v1/profile/`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags profile
   * @name UpdateProfileApiV1ProfilePut
   * @summary Update Profile
   * @request PUT:/api/v1/profile/
   */
  updateProfileApiV1ProfilePut = (
    data: ProfileUpdate,
    params: RequestParams = {},
  ) =>
    this.request<ProfileResponse, HTTPValidationError>({
      path: `/api/v1/profile/`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags settings
   * @name GetSettingsApiV1SettingsGet
   * @summary Get Settings
   * @request GET:/api/v1/settings/
   */
  getSettingsApiV1SettingsGet = (params: RequestParams = {}) =>
    this.request<SettingsResponse, HTTPValidationError>({
      path: `/api/v1/settings/`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags settings
   * @name UpdateSettingsApiV1SettingsPut
   * @summary Update Settings
   * @request PUT:/api/v1/settings/
   */
  updateSettingsApiV1SettingsPut = (
    data: SettingsUpdate,
    params: RequestParams = {},
  ) =>
    this.request<SettingsResponse, HTTPValidationError>({
      path: `/api/v1/settings/`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags listings
   * @name GetAllListingsApiV1ListingsGet
   * @summary Get All Listings
   * @request GET:/api/v1/listings/
   */
  getAllListingsApiV1ListingsGet = (params: RequestParams = {}) =>
    this.request<ListingsResponse, any>({
      path: `/api/v1/listings/`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags listings
   * @name CreateListingApiV1ListingsPost
   * @summary Create Listing
   * @request POST:/api/v1/listings/
   */
  createListingApiV1ListingsPost = (
    data: ListingCreate,
    params: RequestParams = {},
  ) =>
    this.request<ListingResponse, HTTPValidationError>({
      path: `/api/v1/listings/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags listings
   * @name GetMyListingsApiV1ListingsMyGet
   * @summary Get My Listings
   * @request GET:/api/v1/listings/my
   */
  getMyListingsApiV1ListingsMyGet = (params: RequestParams = {}) =>
    this.request<ListingsResponse, HTTPValidationError>({
      path: `/api/v1/listings/my`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags listings
   * @name GetListingApiV1ListingsListingIdGet
   * @summary Get Listing
   * @request GET:/api/v1/listings/{listing_id}
   */
  getListingApiV1ListingsListingIdGet = (
    listingId: string,
    params: RequestParams = {},
  ) =>
    this.request<ListingResponse, HTTPValidationError>({
      path: `/api/v1/listings/${listingId}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags listings
   * @name UpdateListingApiV1ListingsListingIdPut
   * @summary Update Listing
   * @request PUT:/api/v1/listings/{listing_id}
   */
  updateListingApiV1ListingsListingIdPut = (
    listingId: string,
    data: ListingUpdate,
    params: RequestParams = {},
  ) =>
    this.request<ListingResponse, HTTPValidationError>({
      path: `/api/v1/listings/${listingId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags listings
   * @name DeleteListingApiV1ListingsListingIdDelete
   * @summary Delete Listing
   * @request DELETE:/api/v1/listings/{listing_id}
   */
  deleteListingApiV1ListingsListingIdDelete = (
    listingId: string,
    params: RequestParams = {},
  ) =>
    this.request<void, HTTPValidationError>({
      path: `/api/v1/listings/${listingId}`,
      method: "DELETE",
      ...params,
    });
}
