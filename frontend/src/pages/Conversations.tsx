import { MessageCircle } from 'lucide-react';

export default function Conversations() {
  const conversations = [
    {
      id: 1,
      customer: 'John Smith',
      channel: 'Slack',
      lastMessage: 'Thanks for your help!',
      status: 'resolved',
      messages: 5,
      startTime: '2 hours ago',
    },
    {
      id: 2,
      customer: 'Sarah Johnson',
      channel: 'WhatsApp',
      lastMessage: 'How can I track my order?',
      status: 'active',
      messages: 3,
      startTime: '15 minutes ago',
    },
    {
      id: 3,
      customer: 'Mike Davis',
      channel: 'Email',
      lastMessage: 'Is there a discount available?',
      status: 'pending',
      messages: 2,
      startTime: '1 hour ago',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
      case 'active':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Conversations</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          View and manage all customer conversations
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {['All', 'Active', 'Resolved', 'Pending'].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              filter === 'All'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Conversations List */}
      <div className="space-y-4">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {conversation.customer.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {conversation.customer}
                    </h3>
                    <p className="text-sm text-slate-500">Channel: {conversation.channel}</p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mt-3 line-clamp-1">
                  {conversation.lastMessage}
                </p>

                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                  <span>Started {conversation.startTime}</span>
                  <span>{conversation.messages} messages</span>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(conversation.status)}`}>
                  {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
                </span>
                <MessageCircle className="text-slate-400" size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
