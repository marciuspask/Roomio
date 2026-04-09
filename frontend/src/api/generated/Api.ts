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
  ConversationResponse,
  ConversationsResponse,
  GeocodeResult,
  HTTPValidationError,
  ListingCreate,
  ListingResponse,
  ListingUpdate,
  ListingsResponse,
  MeResponse,
  MessageCreate,
  MessageResponse,
  MessagesResponse,
  ProfileResponse,
  ProfileUpdate,
  SavedListingsResponse,
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
   * @tags geocode
   * @name GeocodeApiV1GeocodeGet
   * @summary Geocode
   * @request GET:/api/v1/geocode
   */
  geocodeApiV1GeocodeGet = (
    query: {
      /**
       * Address
       * @minLength 1
       */
      address: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<GeocodeResult, HTTPValidationError>({
      path: `/api/v1/geocode`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
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
    this.request<ProfileResponse, HTTPValidationError>({
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
   * @tags profile
   * @name GetPublicProfileApiV1UsersUserIdProfileGet
   * @summary Get Public Profile
   * @request GET:/api/v1/users/{user_id}/profile
   */
  getPublicProfileApiV1UsersUserIdProfileGet = (
    userId: string,
    params: RequestParams = {},
  ) =>
    this.request<ProfileResponse, HTTPValidationError>({
      path: `/api/v1/users/${userId}/profile`,
      method: "GET",
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
  /**
   * No description
   *
   * @tags messages
   * @name GetMyConversationsApiV1ConversationsGet
   * @summary Get My Conversations
   * @request GET:/api/v1/conversations/
   */
  getMyConversationsApiV1ConversationsGet = (params: RequestParams = {}) =>
    this.request<ConversationsResponse, HTTPValidationError>({
      path: `/api/v1/conversations/`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags messages
   * @name GetConversationApiV1ConversationsConversationIdGet
   * @summary Get Conversation
   * @request GET:/api/v1/conversations/{conversation_id}
   */
  getConversationApiV1ConversationsConversationIdGet = (
    conversationId: string,
    params: RequestParams = {},
  ) =>
    this.request<ConversationResponse, HTTPValidationError>({
      path: `/api/v1/conversations/${conversationId}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags messages
   * @name GetMessagesApiV1ConversationsConversationIdMessagesGet
   * @summary Get Messages
   * @request GET:/api/v1/conversations/{conversation_id}/messages
   */
  getMessagesApiV1ConversationsConversationIdMessagesGet = (
    conversationId: string,
    params: RequestParams = {},
  ) =>
    this.request<MessagesResponse, HTTPValidationError>({
      path: `/api/v1/conversations/${conversationId}/messages`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags messages
   * @name SendMessageApiV1ConversationsConversationIdMessagesPost
   * @summary Send Message
   * @request POST:/api/v1/conversations/{conversation_id}/messages
   */
  sendMessageApiV1ConversationsConversationIdMessagesPost = (
    conversationId: string,
    data: MessageCreate,
    params: RequestParams = {},
  ) =>
    this.request<MessageResponse, HTTPValidationError>({
      path: `/api/v1/conversations/${conversationId}/messages`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags messages
   * @name MarkAsReadApiV1ConversationsConversationIdReadPost
   * @summary Mark As Read
   * @request POST:/api/v1/conversations/{conversation_id}/read
   */
  markAsReadApiV1ConversationsConversationIdReadPost = (
    conversationId: string,
    params: RequestParams = {},
  ) =>
    this.request<void, HTTPValidationError>({
      path: `/api/v1/conversations/${conversationId}/read`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @tags messages
   * @name StartConversationApiV1ListingsListingIdMessagePost
   * @summary Start Conversation
   * @request POST:/api/v1/listings/{listing_id}/message
   */
  startConversationApiV1ListingsListingIdMessagePost = (
    listingId: string,
    data: MessageCreate,
    params: RequestParams = {},
  ) =>
    this.request<ConversationResponse, HTTPValidationError>({
      path: `/api/v1/listings/${listingId}/message`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags saved
   * @name GetSavedListingsApiV1SavedGet
   * @summary Get Saved Listings
   * @request GET:/api/v1/saved/
   */
  getSavedListingsApiV1SavedGet = (params: RequestParams = {}) =>
    this.request<SavedListingsResponse, HTTPValidationError>({
      path: `/api/v1/saved/`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags saved
   * @name SaveListingApiV1SavedListingIdPost
   * @summary Save Listing
   * @request POST:/api/v1/saved/{listing_id}
   */
  saveListingApiV1SavedListingIdPost = (
    listingId: string,
    params: RequestParams = {},
  ) =>
    this.request<any, HTTPValidationError>({
      path: `/api/v1/saved/${listingId}`,
      method: "POST",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags saved
   * @name UnsaveListingApiV1SavedListingIdDelete
   * @summary Unsave Listing
   * @request DELETE:/api/v1/saved/{listing_id}
   */
  unsaveListingApiV1SavedListingIdDelete = (
    listingId: string,
    params: RequestParams = {},
  ) =>
    this.request<void, HTTPValidationError>({
      path: `/api/v1/saved/${listingId}`,
      method: "DELETE",
      ...params,
    });
}
