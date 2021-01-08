import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory, useTheme } from '@grafana/ui';
import * as d3 from 'd3';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const theme = useTheme();
  const styles = getStyles();
  let color: string;
  switch (options.color) {
    case 'red':
      color = theme.palette.redBase;
      break;
    case 'green':
      color = theme.palette.greenBase;
      break;
    case 'blue':
      color = theme.palette.blue95;
      break;
  }
  // https://grafana.com/docs/grafana/latest/developers/plugins/data-frames/
  const radii = data.series
    .map(series => series.fields.find(field => field.type === 'number'))
    .map(field => field?.values.get(field.values.length - 1));

  const values = [4, 8, 15, 16, 23, 42];
  // const barHeight = height / values.length;

  const scale = d3
    .scaleLinear()
    .domain([0, d3.max(values) || 0.0])
    .range([0, width]);

  const axis = d3.axisBottom(scale);
  const padding = 20;
  const chartHeight = height - padding;
  const barHeight = chartHeight / values.length;

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <svg
        className={styles.svg}
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox={`0 -${height / 2} ${width} ${height}`}
      >
        <g fill={color}>
          {radii.map((radius, index) => {
            const step = width / radii.length;
            return <circle r={radius} transform={`translate(${index * step + step / 2}, 0)`} />;
          })}
        </g>
      </svg>

      <svg width={width} height={height}>
        <g>
          {values.map((value, i) => (
            <rect x={0} y={i * barHeight} width={scale(value)} height={barHeight - 1} fill={theme.palette.greenBase} />
          ))}
        </g>
        <g
          transform={`translate(0, ${chartHeight})`}
          ref={node => {
            d3.select(node).call(axis as any);
          }}
        />
      </svg>

      <div className={styles.textBox}>
        {options.showSeriesCount && (
          <div
            className={css`
              font-size: ${theme.typography.size[options.seriesCountSize]};
            `}
          >
            Number of series: {data.series.length}
          </div>
        )}
        <div>Text option value: {options.text}</div>
      </div>
    </div>
  );
};

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
});
