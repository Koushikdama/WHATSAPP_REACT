import React from 'react';

interface LineChartProps {
    data: { label: string; value: number }[];
    height?: number;
    color?: string;
    showDots?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
    data,
    height = 200,
    color = '#10b981',
    showDots = true
}) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                <p>No data available</p>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    // Calculate points
    const points = data.map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 90 - ((item.value - minValue) / range) * 80;
        return { x, y, value: item.value };
    });

    // Create path
    const pathData = points.map((point, index) =>
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    // Create area path (for gradient fill)
    const areaPath = `${pathData} L 100 90 L 0 90 Z`;

    return (
        <div className="w-full" style={{ height }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                <defs>
                    {/* Gradient for area fill */}
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0, 25, 50, 75].map(y => (
                    <line
                        key={y}
                        x1="0"
                        y1={10 + y * 0.8}
                        x2="100"
                        y2={10 + y * 0.8}
                        stroke="#374151"
                        strokeWidth="0.2"
                        opacity="0.5"
                    />
                ))}

                {/* Area fill */}
                <path
                    d={areaPath}
                    fill="url(#lineGradient)"
                />

                {/* Line */}
                <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="0.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Dots */}
                {showDots && points.map((point, index) => (
                    <g key={index}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="1"
                            fill={color}
                            className="transition-all duration-200 hover:r-2"
                        />
                        {/* Tooltip on hover */}
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="3"
                            fill="transparent"
                            className="cursor-pointer"
                        >
                            <title>{`${data[index].label}: ${point.value}`}</title>
                        </circle>
                    </g>
                ))}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 px-2">
                {data.map((item, index) => {
                    // Show only first, middle, and last labels to avoid crowding
                    if (index === 0 || index === Math.floor(data.length / 2) || index === data.length - 1) {
                        return (
                            <div key={index} className="text-xs text-gray-400">
                                {item.label}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

export default LineChart;
