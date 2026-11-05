import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, X, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNotificationClick = (complaintId: string, notifId: string) => {
    markAsRead(notifId);
    onClose();
    navigate(`/citizen/track?id=${complaintId}`);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'forwarded':
        return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
      case 'in_progress':
        return <ArrowRight className="w-4 h-4 text-cyan-600" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Municipal Notifications</h3>
            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
              {notifications.filter((n) => !n.read).length} new
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-slate-400 mt-1">Updates on your civic issues will appear here</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif.complaintId, notif.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  notif.read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50/80 border border-blue-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-white border border-slate-200 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{notif.title}</h4>
                      <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-blue-600 font-medium">
                      <span className="font-mono text-slate-500">{notif.complaintId}</span>
                      <span className="flex items-center gap-1 hover:underline">
                        <span>View timeline</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
