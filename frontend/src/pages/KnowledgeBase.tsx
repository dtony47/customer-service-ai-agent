import { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState('faqs');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'faqs', label: 'FAQs', count: 12 },
    { id: 'policies', label: 'Policies', count: 5 },
    { id: 'sops', label: 'SOPs', count: 8 },
  ];

  const items = [
    {
      id: 1,
      title: 'How do I reset my password?',
      preview: 'Click on "Forgot Password" on the login page...',
      lastUpdated: '2 hours ago',
    },
    {
      id: 2,
      title: 'What are your business hours?',
      preview: 'We are open Monday - Friday, 9AM - 6PM EST...',
      lastUpdated: '1 day ago',
    },
    {
      id: 3,
      title: 'How can I cancel my subscription?',
      preview: 'You can cancel anytime from your account settings...',
      lastUpdated: '3 days ago',
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Knowledge Base
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your FAQs, policies, and standard operating procedures
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          <Plus size={20} />
          Add New Item
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-sm text-slate-500">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2">{item.preview}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">
                  Last updated: {item.lastUpdated}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                  <Edit2 size={18} />
                </button>
                <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
