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

/** UserRole */
export enum UserRole {
  Admin = "admin",
  User = "user",
}

/** Theme */
export enum Theme {
  Light = "light",
  Dark = "dark",
  System = "system",
}

/** TenantType */
export enum TenantType {
  User = "user",
}

/** Occupation */
export enum Occupation {
  Student = "student",
  Working = "working",
  Other = "other",
}

/** ListingType */
export enum ListingType {
  Offering = "offering",
  Seeking = "seeking",
}

/** ListingStatus */
export enum ListingStatus {
  Draft = "draft",
  Active = "active",
  Paused = "paused",
  Archived = "archived",
}

/** GenderPref */
export enum GenderPref {
  Any = "any",
  Male = "male",
  Female = "female",
}

/** EmailDigest */
export enum EmailDigest {
  Daily = "daily",
  Weekly = "weekly",
  Never = "never",
}

/** ConversationStatus */
export enum ConversationStatus {
  Active = "active",
  Archived = "archived",
}

/** AuthMethod */
export enum AuthMethod {
  Bearer = "bearer",
}

/** AdminTestData */
export interface AdminTestData {
  /**
   * Message
   * Confirmation of admin access
   */
  message: string;
  /**
   * User Id
   * Authenticated admin user ID
   */
  user_id: string;
}

/** AdminTestResponse */
export interface AdminTestResponse {
  /** Admin test result */
  data: AdminTestData;
}

/** Conversation */
export interface Conversation {
  /**
   * Id
   * Unique conversation identifier (UUID)
   */
  id: string;
  /**
   * Listing Id
   * Identifier of the listing this conversation is about
   */
  listing_id: string;
  /**
   * Participant Ids
   * Tenant IDs of both participants
   */
  participant_ids: string[];
  /** Current status of the conversation */
  status: ConversationStatus;
  /** Most recent message */
  last_message?: Message | null;
  /**
   * Created At
   * Timestamp when the conversation was created
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * Timestamp when the conversation was last updated
   * @format date-time
   */
  updated_at: string;
}

/** ConversationResponse */
export interface ConversationResponse {
  /** The conversation data */
  data: Conversation;
}

/** ConversationsResponse */
export interface ConversationsResponse {
  /**
   * Data
   * List of conversations
   */
  data: Conversation[];
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthData */
export interface HealthData {
  /**
   * Status
   * Current health status of the API
   */
  status: string;
  /**
   * Version
   * Running application version
   */
  version: string;
  /**
   * Environment
   * Host the server is bound to
   */
  environment: string;
  /**
   * Debug
   * Whether debug mode is enabled
   */
  debug: boolean;
}

/** HealthResponse */
export interface HealthResponse {
  /** Health check data */
  data: HealthData;
}

/** Listing */
export interface Listing {
  /**
   * Id
   * Unique listing identifier
   */
  id: string;
  /**
   * Tenant Id
   * Owner's tenant identifier for data isolation
   */
  tenant_id: string;
  /** Whether offering or seeking a room */
  listing_type: ListingType;
  /**
   * Title
   * Short headline for the listing
   */
  title: string;
  /**
   * Description
   * Full description of the listing
   */
  description: string;
  /**
   * City
   * City where the room is located
   */
  city: string;
  /**
   * District
   * District or neighbourhood within the city
   */
  district: string | null;
  /**
   * Price
   * Monthly rent price in local currency
   */
  price: number;
  /**
   * Utilities Incl
   * Whether utilities are included in the price
   */
  utilities_incl: boolean;
  /**
   * Available From
   * Date from which the room is available
   * @format date
   */
  available_from: string;
  /**
   * Allows Smoking
   * Whether smoking is permitted
   */
  allows_smoking: boolean;
  /**
   * Allows Pets
   * Whether pets are permitted
   */
  allows_pets: boolean;
  /** Preferred gender of the tenant */
  gender_pref: GenderPref;
  /** Current listing status */
  status: ListingStatus;
  /**
   * Is Boosted
   * Whether the listing is boosted for higher visibility
   */
  is_boosted: boolean;
  /**
   * Created At
   * When the listing was created
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * When the listing was last updated
   * @format date-time
   */
  updated_at: string;
}

/** ListingCreate */
export interface ListingCreate {
  /** Whether offering or seeking a room */
  listing_type: ListingType;
  /**
   * Title
   * Short headline for the listing
   */
  title: string;
  /**
   * Description
   * Full description of the listing
   */
  description: string;
  /**
   * City
   * City where the room is located
   */
  city: string;
  /**
   * District
   * District or neighbourhood
   */
  district?: string | null;
  /**
   * Price
   * Monthly rent price in local currency
   */
  price: number;
  /**
   * Utilities Incl
   * Whether utilities are included
   * @default false
   */
  utilities_incl?: boolean;
  /**
   * Available From
   * Date from which the room is available
   * @format date
   */
  available_from: string;
  /**
   * Allows Smoking
   * Whether smoking is permitted
   * @default false
   */
  allows_smoking?: boolean;
  /**
   * Allows Pets
   * Whether pets are permitted
   * @default false
   */
  allows_pets?: boolean;
  /**
   * Preferred gender of the tenant
   * @default "any"
   */
  gender_pref?: GenderPref;
  /**
   * Initial listing status
   * @default "draft"
   */
  status?: ListingStatus;
}

/** ListingResponse */
export interface ListingResponse {
  /** Listing entity */
  data: Listing;
}

/** ListingUpdate */
export interface ListingUpdate {
  /** Whether offering or seeking a room */
  listing_type?: ListingType | null;
  /**
   * Title
   * Short headline for the listing
   */
  title?: string | null;
  /**
   * Description
   * Full description of the listing
   */
  description?: string | null;
  /**
   * City
   * City where the room is located
   */
  city?: string | null;
  /**
   * District
   * District or neighbourhood
   */
  district?: string | null;
  /**
   * Price
   * Monthly rent price in local currency
   */
  price?: number | null;
  /**
   * Utilities Incl
   * Whether utilities are included
   */
  utilities_incl?: boolean | null;
  /**
   * Available From
   * Date from which the room is available
   */
  available_from?: string | null;
  /**
   * Allows Smoking
   * Whether smoking is permitted
   */
  allows_smoking?: boolean | null;
  /**
   * Allows Pets
   * Whether pets are permitted
   */
  allows_pets?: boolean | null;
  /** Preferred gender of the tenant */
  gender_pref?: GenderPref | null;
  /** Current listing status */
  status?: ListingStatus | null;
}

/** ListingsResponse */
export interface ListingsResponse {
  /**
   * Data
   * List of listing entities
   */
  data: Listing[];
}

/** MeData */
export interface MeData {
  /**
   * Tenant Id
   * Tenant identifier for data isolation
   */
  tenant_id: string;
  /** Type of tenant (user, future: organization) */
  tenant_type: TenantType;
  /**
   * User Id
   * Unique user identifier
   */
  user_id: string;
  /**
   * Username
   * Display name
   */
  username: string;
  /**
   * Email
   * Email address
   */
  email: string | null;
  /** User role (admin or user) */
  role: UserRole;
  /** How the user authenticated */
  auth_method: AuthMethod;
  /**
   * Is Admin
   * Whether user has admin privileges
   */
  is_admin: boolean;
}

/** MeResponse */
export interface MeResponse {
  /** Authenticated user context */
  data: MeData;
}

/** Message */
export interface Message {
  /**
   * Id
   * Unique message identifier (UUID)
   */
  id: string;
  /**
   * Conversation Id
   * Conversation this message belongs to
   */
  conversation_id: string;
  /**
   * Sender Id
   * Tenant identifier of the user who sent the message
   */
  sender_id: string;
  /**
   * Body
   * Text content of the message
   */
  body: string;
  /**
   * Created At
   * Timestamp when the message was sent
   * @format date-time
   */
  created_at: string;
}

/** MessageCreate */
export interface MessageCreate {
  /**
   * Body
   * Text content of the message
   * @maxLength 2000
   */
  body: string;
}

/** MessageResponse */
export interface MessageResponse {
  /** The message data */
  data: Message;
}

/** MessagesResponse */
export interface MessagesResponse {
  /**
   * Data
   * List of messages in the conversation
   */
  data: Message[];
}

/** Profile */
export interface Profile {
  /**
   * Id
   * Unique profile identifier (UUID)
   */
  id: string;
  /**
   * Tenant Id
   * Owner's tenant identifier for data isolation
   */
  tenant_id: string;
  /**
   * Display Name
   * Publicly visible name shown on listings and messages
   */
  display_name: string;
  /**
   * Bio
   * Short description the user writes about themselves
   * @default ""
   */
  bio?: string;
  /** User's employment status */
  occupation?: Occupation | null;
  /**
   * Email
   * User's email address
   */
  email?: string | null;
  /**
   * Is Email Verified
   * Email has been verified
   * @default false
   */
  is_email_verified?: boolean;
  /**
   * Is Phone Verified
   * Phone number has been verified
   * @default false
   */
  is_phone_verified?: boolean;
  /**
   * Created At
   * Timestamp when the profile was created
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * Timestamp when the profile was last updated
   * @format date-time
   */
  updated_at: string;
}

/** ProfileResponse */
export interface ProfileResponse {
  /** The user's profile data */
  data: Profile;
}

/** ProfileUpdate */
export interface ProfileUpdate {
  /**
   * Display Name
   * Publicly visible name shown on listings and messages
   */
  display_name?: string | null;
  /**
   * Bio
   * Short description the user writes about themselves
   */
  bio?: string | null;
  /** User's employment status */
  occupation?: Occupation | null;
  /**
   * Email
   * User's email address
   */
  email?: string | null;
  /**
   * Is Email Verified
   * Whether the user's email has been verified
   */
  is_email_verified?: boolean | null;
  /**
   * Is Phone Verified
   * Whether the user's phone number has been verified
   */
  is_phone_verified?: boolean | null;
}

/** Settings */
export interface Settings {
  /**
   * Id
   * Unique settings identifier
   */
  id: string;
  /** UI theme preference */
  theme: Theme;
  /**
   * Language
   * Preferred language code
   */
  language: string;
  /**
   * Notifications Enabled
   * Whether push notifications are enabled
   */
  notifications_enabled: boolean;
  /** Email digest frequency */
  email_digest: EmailDigest;
  /**
   * Timezone
   * User timezone
   */
  timezone: string;
  /**
   * Tenant Id
   * Tenant identifier for data isolation
   */
  tenant_id: string;
  /**
   * Created At
   * When settings were created
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * When settings were last updated
   * @format date-time
   */
  updated_at: string;
}

/** SettingsResponse */
export interface SettingsResponse {
  /** Settings entity */
  data: Settings;
}

/** SettingsUpdate */
export interface SettingsUpdate {
  /** UI theme preference */
  theme?: Theme | null;
  /**
   * Language
   * Preferred language code
   */
  language?: string | null;
  /**
   * Notifications Enabled
   * Whether push notifications are enabled
   */
  notifications_enabled?: boolean | null;
  /** Email digest frequency */
  email_digest?: EmailDigest | null;
  /**
   * Timezone
   * User timezone
   */
  timezone?: string | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
  /** Input */
  input?: any;
  /** Context */
  ctx?: object;
}
