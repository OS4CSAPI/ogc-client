import { setQueryParams } from '../shared/url-utils.js';
import {
  BoundingBox,
  CrsCode,
  MimeType,
  TimeInterval,
} from '../shared/models.js';
import {
  WmsLayerDimensionInterval,
  WmsLayerDimensionValue,
  WmsVersion,
} from './model.js';

/**
 * Generates an URL for a GetMap operation
 * @param serviceUrl
 * @param version
 * @param layers Comma-separated list of layers to render
 * @param widthPx
 * @param heightPx
 * @param crs Coordinate reference system to use for the image
 * @param extent Expressed in the requested CRS
 * @param outputFormat
 * @param [styles] Comma-separated list of styles to use; leave out for default style
 * @param [time] Time value for the request; refer to the `timeDimension` property of the layer for available values
 * @param [elevation] Elevation value for the request; refer to the `elevationDimension` property of the layer for available values
 * @param [dimensions] Dimension values keyed by dimension name (case-insensitive, e.g. { time: '...' }); they are added under the form DIM_* in the request
 */
export function generateGetMapUrl(
  serviceUrl: string,
  version: WmsVersion,
  layers: string,
  widthPx: number,
  heightPx: number,
  crs: CrsCode,
  extent: BoundingBox,
  outputFormat: MimeType,
  styles?: string,
  time?: Date | Date[] | Omit<TimeInterval, 'period'> | 'current',
  elevation?:
    | WmsLayerDimensionValue
    | WmsLayerDimensionValue[]
    | Omit<WmsLayerDimensionInterval, 'resolution'>,
  dimensions?: Record<
    string,
    | WmsLayerDimensionValue
    | WmsLayerDimensionValue[]
    | Omit<WmsLayerDimensionInterval, 'resolution'>
  >,
): string {
  const crsParam = version === '1.3.0' ? 'CRS' : 'SRS';

  const newParams = {
    SERVICE: 'WMS',
    REQUEST: 'GetMap',
    VERSION: version,
    LAYERS: layers,
    STYLES: styles ?? '',
    WIDTH: widthPx.toString(),
    HEIGHT: heightPx.toString(),
    FORMAT: outputFormat ?? 'image/png',
    [crsParam]: crs,
    BBOX: extent.join(','),
  };

  function formatDimensionValues(
    values:
      | Date
      | Date[]
      | Omit<TimeInterval, 'period'>
      | 'current'
      | WmsLayerDimensionValue
      | WmsLayerDimensionValue[]
      | Omit<WmsLayerDimensionInterval, 'resolution'>,
  ): string {
    if (Array.isArray(values)) {
      return values.map(formatDimensionValues).join(',');
    }
    if (values instanceof Object && 'begin' in values && 'end' in values) {
      return `${formatDimensionValues(values.begin)}/${formatDimensionValues(values.end)}`;
    }
    if (values instanceof Date) {
      return values.toISOString();
    }
    return values.toString();
  }

  if (time !== undefined) {
    newParams['TIME'] = formatDimensionValues(time);
  }
  if (elevation !== undefined) {
    newParams['ELEVATION'] = formatDimensionValues(elevation);
  }
  if (dimensions) {
    for (const [name, value] of Object.entries(dimensions)) {
      newParams[`DIM_${name.toUpperCase()}`] = formatDimensionValues(value);
    }
  }

  return setQueryParams(serviceUrl, newParams);
}

/**
 * Generates an URL for a DescribeLayer operation
 * @param serviceUrl
 * @param version
 * @param layerName Layer name to describe
 */
export function generateDescribeLayerUrl(
  serviceUrl: string,
  version: WmsVersion,
  layerName: string,
): string {
  return setQueryParams(serviceUrl, {
    SERVICE: 'WMS',
    REQUEST: 'DescribeLayer',
    VERSION: version,
    LAYERS: layerName,
    SLD_VERSION: '1.1.0',
  });
}
