import React from 'react';

interface PieChartProps {
    data: { label: string; value: number; color: string }[];
    size?: number;
    donut?: boolean;
    showLabels?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
    data,
    size = 200,
    donut = false,
    showLabels = true
}) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                <p>No data available</p>
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = 50;
    const innerRadius = donut ? 30 : 0;

    let currentAngle = -90; // Start from top

    const slices = data.map((item) => {
        const percentage = (item.value / total) * 100;
        const angle = (item.value / total) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;

        currentAngle = endAngle;

        // Calculate arc path
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = 50 + radius * Math.cos(startRad);
        const y1 = 50 + radius * Math.sin(startRad);
        const x2 = 50 + radius * Math.cos(endRad);
        const y2 = 50 + radius * Math.sin(endRad);

        const largeArc = angle > 180 ? 1 : 0;

        let path;
        if (donut) {
            const ix1 = 50 + innerRadius * Math.cos(startRad);
            const iy1 = 50 + innerRadius * Math.sin(startRad);
            const ix2 = 50 + innerRadius * Math.cos(endRad);
            const iy2 = 50 + innerRadius * Math.sin(endRad);

            path = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        L ${ix2} ${iy2}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}
        Z
      `;
        } else {
            path = `
        M 50 50
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        Z
      `;
        }

        return {
            ...item,
            path,
            percentage: percentage.toFixed(1),
            midAngle: (startAngle + endAngle) / 2,
        };
    });

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} viewBox="0 0 100 100">
                {slices.map((slice, index) => (
                    <g key={index}>
                        <path
                            d={slice.path}
                            fill={slice.color}
                            opacity="0.9"
                            className="transition-all duration-300 hover:opacity-100 cursor-pointer"
                        >
                            <title>{`${slice.label}: ${slice.value} (${slice.percentage}%)`}</title>
                        </path>
                    </g>
                ))}

                {/* Center text for donut */}
                {donut && (
                    <text
                        x="50"
                        y="50"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xl font-bold fill-gray-300"
                        fontSize="8"
                    >
                        {total}
                    </text>
                )}
            </svg>

            {/* Legend */}
            {showLabels && (
                <div className="mt-4 space-y-2 w-full max-w-xs">
                    {slices.map((slice, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: slice.color }}
                                />
                                <span className="text-gray-300">{slice.label}</span>
                            </div>
                            <span className="text-gray-400 font-medium">
                                {slice.percentage}%
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PieChart;
