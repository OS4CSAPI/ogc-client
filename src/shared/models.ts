/**
 * Expressed as minx, miny, maxx, maxy
 */
export type BoundingBox = [number, number, number, number];

export type CrsCode = string;

export interface Address {
  deliveryPoint?: string;
  city?: string;
  administrativeArea?: string;
  postalCode?: string;
  country?: string;
}

export interface Contact {
  name?: string;
  organization?: string;
  position?: string;
  phone?: string;
  fax?: string;
  address?: Address;
  email?: string;
}

export interface Provider {
  name?: string;
  site?: string;
  contact?: Contact;
}

export type GenericEndpointInfo = {
  name: string;
  title: string;
  abstract: string;
  fees: string;
  constraints: string;
  keywords: string[];
  provider?: Provider;
  /**
   * Can contain the list of outputFormats from a WFS GetCapabilities,
   * or the list of 'Formats' from a WMS GetCapabilities
   */
  outputFormats?: MimeType[];
  /**
   * Contains a list of formats that can be used for WMS GetFeatureInfo,
   * or undefined for other services such as WFS
   */
  infoFormats?: MimeType[];
  /**
   * Contains a list of formats that can be used for Exceptions for WMS GetMap,
   * or undefined for other services such as WFS
   */
  exceptionFormats?: MimeType[] | string[];
};

export type MimeType = string;

export interface FetchOptions {
  headers?: Record<string, string>;
  mode?: 'same-origin' | 'cors' | 'no-cors';
  credentials?: 'same-origin' | 'include' | 'omit';
  redirect?: 'follow' | 'error';
  referrer?: string;
  integrity?: string;
}

export type OperationName = string;
export type HttpMethod = 'Get' | 'Post';
export type OperationUrl = Partial<Record<HttpMethod, string>>;

export interface LayerStyle {
  name: string;
  title: string;
  abstract?: string;
  /**
   * May not be defined; a GetLegendGraphic operation should work in any case
   */
  legendUrl?: string;
}

export type MetadataURL = {
  format?: string;
  type?: string;
  url: string;
};

export type FieldName = string;
export type FieldSort = ['D' | 'A', FieldName];

export type DateTimeParameter =
  Date | { start: Date } | { end: Date } | { start: Date; end: Date };

/**
 * This matches the ISO8601 definition of a duration
 * Will be replaced by the [Temporal API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal) once support is broad enough
 */
export type Duration = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/**
 * Describes an interval in time. Use the `expandTimeInterval` utility function to expand this interval into a list
 * of discrete Date objects.
 */
export interface TimeInterval {
  begin: Date;
  end: Date;

  /**
   * The period indicates the amount of time between each update of the data
   */
  period: Duration;
}
