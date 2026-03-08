import { Settings as SettingsIcon, Bell, Lock, Database, AlertCircle } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Configure your Customer Service AI Agent
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Channel Configuration */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <SettingsIcon size={20} />
            Channel Configuration
          </h2>
          <div className="space-y-4">
            {['Slack', 'WhatsApp', 'Email', 'Voice'].map((channel) => (
              <div key={channel} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                <span className="font-medium text-slate-900 dark:text-white">{channel}</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Enabled</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell size={20} />
            Notifications
          </h2>
          <div className="space-y-4">
            {[
              { label: 'New conversations', description: 'Alert when new conversations start' },
              { label: 'Low resolution rate', description: 'Alert when resolution drops below 90%' },
              { label: 'Channel downtime', description: 'Alert when a channel goes offline' },
            ].map((item) => (
              <div key={item.label} className="flex items-start justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* API & Security */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock size={20} />
            API & Security
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value="sk_test_••••••••••••••••"
                  readOnly
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg">
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Model Configuration */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Database size={20} />
            AI Model Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Model
              </label>
              <select className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                <option>Google Gemini Pro</option>
                <option>Google Gemini Pro Vision</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Temperature (0.0 - 1.0)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.7"
                className="w-full"
              />
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Controls response creativity. Lower = more precise, Higher = more creative
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Max Response Tokens
              </label>
              <input
                type="number"
                defaultValue="500"
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            Danger Zone
          </h2>
          <p className="text-sm text-red-800 dark:text-red-200 mb-4">
            These actions cannot be undone. Please be careful.
          </p>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
            Clear Conversation History
          </button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button className="px-6 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800">
            Cancel
          </button>
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
