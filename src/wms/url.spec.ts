import { generateGetMapUrl } from './url.js';

describe('generateGetMapUrl', () => {
  it('generates a correct URL (v1.1.0, no styles)', () => {
    expect(
      generateGetMapUrl(
        'http://example.com/wms',
        '1.1.0',
        'layer1,layer2',
        100,
        200,
        'EPSG:4326',
        [10, 20, 100, 200],
        'image/png',
      ),
    ).toBe(
      'http://example.com/wms?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.0&LAYERS=layer1%2Clayer2&STYLES=&WIDTH=100&HEIGHT=200&FORMAT=image%2Fpng&SRS=EPSG%3A4326&BBOX=10%2C20%2C100%2C200',
    );
  });
  it('generates a correct URL (v1.3.0, with styles)', () => {
    expect(
      generateGetMapUrl(
        'http://example.com/wms',
        '1.3.0',
        'layer1,layer2',
        100,
        200,
        'EPSG:4326',
        [10, 20, 100, 200],
        'image/png',
        'style1,style2',
      ),
    ).toBe(
      'http://example.com/wms?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=layer1%2Clayer2&STYLES=style1%2Cstyle2&WIDTH=100&HEIGHT=200&FORMAT=image%2Fpng&CRS=EPSG%3A4326&BBOX=10%2C20%2C100%2C200',
    );
  });
  it('appends simple time & elevation values as query params', () => {
    expect(
      generateGetMapUrl(
        'http://example.com/wms',
        '1.3.0',
        'layer1',
        100,
        200,
        'EPSG:4326',
        [10, 20, 100, 200],
        'image/png',
        undefined,
        new Date('2024-01-02T00:00:00Z'),
        1000,
      ),
    ).toBe(
      'http://example.com/wms?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=layer1&STYLES=&WIDTH=100&HEIGHT=200&FORMAT=image%2Fpng&CRS=EPSG%3A4326&BBOX=10%2C20%2C100%2C200&TIME=2024-01-02T00%3A00%3A00.000Z&ELEVATION=1000',
    );
  });
  it('appends complex dimension values as query params', () => {
    expect(
      generateGetMapUrl(
        'http://example.com/wms',
        '1.3.0',
        'layer1',
        100,
        200,
        'EPSG:4326',
        [10, 20, 100, 200],
        'image/png',
        undefined,
        {
          begin: new Date('2024-01-02T00:00:00Z'),
          end: new Date('2024-01-03T00:00:00Z'),
        },
        [1000, 2000, 3000],
        {
          temperature: {
            begin: 12,
            end: 24,
          },
          mass: ['hello', 'world'],
          bands: 'abcd',
          colors: {
            begin: 'red',
            end: 'green',
          },
        },
      ),
    ).toBe(
      'http://example.com/wms?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=layer1&STYLES=&WIDTH=100&HEIGHT=200&FORMAT=image%2Fpng&CRS=EPSG%3A4326&BBOX=10%2C20%2C100%2C200&TIME=2024-01-02T00%3A00%3A00.000Z%2F2024-01-03T00%3A00%3A00.000Z&ELEVATION=1000%2C2000%2C3000&DIM_TEMPERATURE=12%2F24&DIM_MASS=hello%2Cworld&DIM_BANDS=abcd&DIM_COLORS=red%2Fgreen',
    );
  });
  it('appends other dimensions values as query params', () => {
    expect(
      generateGetMapUrl(
        'http://example.com/wms',
        '1.3.0',
        'layer1',
        100,
        200,
        'EPSG:4326',
        [10, 20, 100, 200],
        'image/png',
        undefined,
        undefined,
        undefined,
        {
          temperature: 1234,
        },
      ),
    ).toBe(
      'http://example.com/wms?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=layer1&STYLES=&WIDTH=100&HEIGHT=200&FORMAT=image%2Fpng&CRS=EPSG%3A4326&BBOX=10%2C20%2C100%2C200&DIM_TEMPERATURE=1234',
    );
  });
});
