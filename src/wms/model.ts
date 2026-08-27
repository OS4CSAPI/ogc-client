import {
  BoundingBox,
  CrsCode,
  LayerStyle,
  type MetadataURL,
  TimeInterval,
} from '../shared/models.js';

export type WmsLayerAttribution = {
  title?: string;
  url?: string;
  logoUrl?: string;
};

/**
 * Most dimension values can be represented as numbers; if the values cannot be
 * parsed as numbers, they will be kept as string
 */
export type WmsLayerDimensionValue = number | string;

export interface WmsLayerDimensionInterval {
  begin: WmsLayerDimensionValue;
  end: WmsLayerDimensionValue;

  /**
   * A resolution of 0 means that the value is continuously updated between the start and end of the interval
   */
  resolution: number;
}

export interface WmsLayerDimension {
  name: string;

  /**
   * For instance, "meters"
   */
  units: string;

  /**
   * For instance, "m" for meters
   */
  unitSymbol?: string;

  /**
   * Available values, expressed either as a list of defined values, an interval,
   * or a list of intervals
   */
  values:
    | WmsLayerDimensionValue[]
    | WmsLayerDimensionInterval
    | WmsLayerDimensionInterval[];

  /**
   * Default value used in case no value is specified in the request. If no default
   * value is present, the request will fail with a `MissingDimensionValue` error.
   */
  defaultValue?: WmsLayerDimensionValue;

  /**
   * True if the nearest value will be returned in case the value asked for in a request is not supported
   */
  nearestValue: boolean;

  /**
   * True if this dimension can accept multiple values in a single request
   */
  multipleValues: boolean;
}

export interface WmsLayerTimeDimension {
  name: string;

  isTime: true;

  /**
   * Available values, expressed either as a list of defined values, an interval,
   * or a list of intervals
   */
  values: Date[] | TimeInterval | TimeInterval[];

  /**
   * Default value used in case no value is specified in the request. If no default
   * value is present, the request will fail with a `MissingDimensionValue` error.
   */
  defaultValue?: Date;

  /**
   * True if the nearest value will be returned in case the value asked for in a request is not supported
   */
  nearestValue: boolean;

  /**
   * True if this dimension can accept multiple values in a single request
   */
  multipleValues: boolean;

  /**
   * If this parameter is true, it means that the data is kept up-to-date and that
   * it can be requested with the parameter "time = current" to get the latest data
   */
  current: boolean;
}

export type WmsLayerSummary = {
  /**
   * The layer is renderable if defined
   */
  name?: string;
  title: string;
  abstract?: string;

  /**
   * Not defined if the layer is a leaf in the tree
   */
  children?: WmsLayerSummary[];
};

export type WmsLayerFull = {
  /**
   * The layer is renderable if defined
   */
  name?: string;
  title: string;
  abstract?: string;
  availableCrs: CrsCode[];
  styles: LayerStyle[];
  /**
   * Dict of bounding boxes where keys are CRS codes
   */
  boundingBoxes: Record<CrsCode, BoundingBox>;
  queryable: boolean;
  opaque: boolean;
  maxScaleDenominator?: number;
  minScaleDenominator?: number;
  attribution?: WmsLayerAttribution;
  keywords?: string[];
  metadata?: MetadataURL[];

  /**
   * The `time` dimension has a specific meaning in WMS and is used to represent the data
   * at different points in time; undefined if this layer does not offer temporal data.
   */
  timeDimension?: WmsLayerTimeDimension;

  /**
   * The `elevation` dimension has a specific meaning in WMS; undefined means this
   * layer does not offer elevation data
   */
  elevationDimension?: WmsLayerDimension;

  /**
   * Represents dimensions other than `time` and `elevation`
   * Dimensions
   */
  otherDimensions?: (WmsLayerDimension | WmsLayerTimeDimension)[];

  /**
   * Not defined if the layer is a leaf in the tree
   */
  children?: WmsLayerFull[];
};

export type WmsLayerDescription = {
  layerName: string;
  owsType: 'wcs' | 'wfs';
  owsUrl: string;
  typeName?: string;
};

export type WmsVersion = '1.1.0' | '1.1.1' | '1.3.0';
