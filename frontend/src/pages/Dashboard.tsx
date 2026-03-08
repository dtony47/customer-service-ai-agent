import { BarChart3, MessageCircle, TrendingUp, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    {
      label: 'Active Conversations',
      value: '24',
      icon: MessageCircle,
      trend: '+12%',
    },
    {
      label: 'Messages Processed',
      value: '1,234',
      icon: BarChart3,
      trend: '+23%',
    },
    {
      label: 'Resolution Rate',
      value: '94.2%',
      icon: TrendingUp,
      trend: '+5.1%',
    },
    {
      label: 'Avg Response Time',
      value: '2.3s',
      icon: AlertCircle,
      trend: '-0.5s',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Welcome to your Customer Service AI Agent
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <Icon className="text-blue-500" size={24} />
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-4">{stat.trend}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Recent Conversations
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Customer #{i}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Resolved via Slack
                  </p>
                </div>
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded">
                  Resolved
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Channel Status
          </h2>
          <div className="space-y-3">
            {[
              { name: 'Slack', status: 'Connected' },
              { name: 'WhatsApp', status: 'Connected' },
              { name: 'Email', status: 'Disconnected' },
              { name: 'Voice', status: 'Connected' },
            ].map((channel) => (
              <div key={channel.name} className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">{channel.name}</span>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    channel.status === 'Connected'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                  }`}
                >
                  {channel.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
