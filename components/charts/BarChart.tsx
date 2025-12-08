import React from 'react';

interface BarChartProps {
    data: { label: string; value: number; color?: string }[];
    height?: number;
    showValues?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({ data, height = 300, showValues = true }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                <p>No data available</p>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = 100 / data.length;

    return (
        <div className="w-full" style={{ height }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                {data.map((item, index) => {
                    const barHeight = (item.value / maxValue) * 80;
                    const x = index * barWidth;
                    const y = 90 - barHeight;
                    const color = item.color || '#10b981';

                    return (
                        <g key={index}>
                            {/* Bar */}
                            <rect
                                x={x + barWidth * 0.1}
                                y={y}
                                width={barWidth * 0.8}
                                height={barHeight}
                                fill={color}
                                opacity="0.8"
                                className="transition-all duration-300 hover:opacity-100"
                            />

                            {/* Value label */}
                            {showValues && (
                                <text
                                    x={x + barWidth / 2}
                                    y={y - 2}
                                    fill="#9ca3af"
                                    fontSize="3"
                                    textAnchor="middle"
                                    className="font-medium"
                                >
                                    {item.value}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Labels */}
            <div className="flex justify-around mt-2">
                {data.map((item, index) => (
                    <div key={index} className="text-xs text-gray-400 text-center truncate max-w-[80px]">
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BarChart;
