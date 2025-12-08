import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsLayout from '../../components/layout/SettingsLayout';
import { useAnalytics } from '../../hooks/useAnalytics';
import useLocalStorage from '../../hooks/useLocalStorage';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';
import {
  StatCard,
  ChartTypeSelector,
  FilterSelector,
  EmptyStateMessage,
  LoadingSpinner
} from '../../components/common';

type ChartType = 'line' | 'bar';
type DistributionChartType = 'pie' | 'donut';

const StorageScreen = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<number>(30);
  const [chatType, setChatType] = useState<'all' | 'individual' | 'group'>('all');

  // Use custom hook for chart preferences with localStorage
  const [timeSeriesChart, setTimeSeriesChart] = useLocalStorage<ChartType>('timeSeriesChart', 'line');
  const [distributionChart, setDistributionChart] = useLocalStorage<DistributionChartType>('distributionChart', 'donut');

  const { data, loading } = useAnalytics(timeRange, chatType);

  return (
    <SettingsLayout title="Storage & Analytics" onBack={() => navigate('/settings')}>
      <div className="flex flex-col gap-6 p-4 bg-[#111b21] overflow-y-auto">
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3">
          <FilterSelector
            options={[
              { label: 'Last 7 Days', value: 7 },
              { label: 'Last 30 Days', value: 30 },
              { label: 'Last 90 Days', value: 90 },
              { label: 'Last Year', value: 365 }
            ]}
            value={timeRange}
            onChange={setTimeRange}
          />
          <FilterSelector
            options={[
              { label: 'All Chats', value: 'all' },
              { label: 'Individual', value: 'individual' },
              { label: 'Group', value: 'group' }
            ]}
            value={chatType}
            onChange={setChatType}
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : !data ? (
          <EmptyStateMessage
            icon="📊"
            title="No data available"
            message="Analytics data couldn't be loaded"
          />
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard
                icon="📊"
                value={data.totalMessages}
                label="Messages"
              />
              <StatCard
                icon="📎"
                value={data.totalMediaFiles}
                label="Media Files"
              />
              <StatCard
                icon="💾"
                value={data.storageUsed}
                label="Storage"
                formatter={(val) => `${val.toFixed(2)} GB`}
              />
              <StatCard
                icon="💬"
                value={data.activeChats}
                label="Active Chats"
              />
              <StatCard
                icon="👤"
                value={data.messagesByType.individual}
                label="Individual"
              />
              <StatCard
                icon="👥"
                value={data.messagesByType.group}
                label="Groups"
              />
            </div>

            {/* Most Active Chat */}
            {data.mostActiveChat && (
              <div className="bg-[#202c33] rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">🏆 Most Active Chat</h3>
                <p className="text-lg font-bold text-white">{data.mostActiveChat.name}</p>
                <p className="text-sm text-gray-400">{data.mostActiveChat.count.toLocaleString()} messages</p>
              </div>
            )}

            {/* Messages Over Time - Line/Bar Chart with Selector */}
            <div className="bg-[#202c33] rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">📈 Messages Over Time</h3>
                <ChartTypeSelector
                  options={[
                    { label: 'Line', value: 'line' },
                    { label: 'Bar', value: 'bar' }
                  ]}
                  selected={timeSeriesChart}
                  onChange={(value) => setTimeSeriesChart(value as ChartType)}
                />
              </div>

              {data.messagesPerDay.length > 0 ? (
                timeSeriesChart === 'line' ? (
                  <LineChart data={data.messagesPerDay} height={200} />
                ) : (
                  <BarChart
                    data={data.messagesPerDay.map(d => ({
                      label: d.label,
                      value: d.value,
                      color: '#10b981'
                    }))}
                    height={200}
                  />
                )
              ) : (
                <p className="text-gray-400 text-center py-8">No messages in this period</p>
              )}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Active Chats - Bar Chart */}
              {data.topChats.length > 0 && (
                <div className="bg-[#202c33] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">🎯 Top Active Chats</h3>
                  <BarChart data={data.topChats} height={300} />
                </div>
              )}

              {/* Media Distribution - Pie/Donut Chart with Selector */}
              {data.mediaDistribution.length > 0 && (
                <div className="bg-[#202c33] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">📁 Media Distribution</h3>
                    <ChartTypeSelector
                      options={[
                        { label: 'Pie', value: 'pie' },
                        { label: 'Donut', value: 'donut' }
                      ]}
                      selected={distributionChart}
                      onChange={(value) => setDistributionChart(value as DistributionChartType)}
                    />
                  </div>
                  <PieChart
                    data={data.mediaDistribution}
                    size={250}
                    donut={distributionChart === 'donut'}
                  />
                </div>
              )}

              {/* Chat Type Distribution - Pie Chart */}
              {(data.messagesByType.individual > 0 || data.messagesByType.group > 0) && (
                <div className="bg-[#202c33] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">💬 Chat Type Distribution</h3>
                  <PieChart
                    data={[
                      { label: 'Individual', value: data.messagesByType.individual, color: '#3b82f6' },
                      { label: 'Group', value: data.messagesByType.group, color: '#10b981' }
                    ]}
                    size={250}
                    donut={false}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SettingsLayout>
  );
};

export default StorageScreen;