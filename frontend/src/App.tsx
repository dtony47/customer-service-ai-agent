import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { MessageCircle, Settings, BarChart3, BookOpen } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import KnowledgeBase from './pages/KnowledgeBase';
import Conversations from './pages/Conversations';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Customer AI
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Service Agent</p>
          </div>

          <nav className="space-y-2 px-4">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <BarChart3 size={20} />
              Dashboard
            </Link>

            <Link
              to="/conversations"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <MessageCircle size={20} />
              Conversations
            </Link>

            <Link
              to="/knowledge-base"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <BookOpen size={20} />
              Knowledge Base
            </Link>

            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <Settings size={20} />
              Settings
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
