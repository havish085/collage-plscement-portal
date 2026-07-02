import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbMock, NotificationItem } from '../firebase/dbMock';
import { Bell, MailOpen, CheckCheck, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const Notifications: React.FC = () => {
  const { userProfile } = useAuth();
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    if (!userProfile) return;
    try {
      setLoading(true);
      const list = await dbMock.getNotifications(userProfile.uid);
      setNotifications(list);
    } catch (err) {
      toast.error('Error fetching alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [userProfile]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await dbMock.markNotificationAsRead(id);
      fetchNotifs(); // reload
    } catch (e) {
      //
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      if (unread.length === 0) return;
      await Promise.all(unread.map(n => dbMock.markNotificationAsRead(n.id)));
      toast.success('Marked all alerts as read.');
      fetchNotifs();
    } catch (e) {
      //
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-2xl">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">Alert Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time notifications concerning application status changes, shortlists, or new drives.
          </p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-xs font-bold text-indigo-605 hover:underline"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
            <Bell className="mx-auto mb-2 text-slate-300" size={32} />
            No placement notifications recorded yet.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all ${
                notif.read 
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 text-slate-650' 
                  : 'bg-indigo-50/20 dark:bg-indigo-950/20 border-indigo-200/50 dark:border-indigo-900/50 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs dark:text-white">{notif.title}</span>
                    {!notif.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">{notif.message}</p>
                  
                  <div className="pt-2 text-[9px] text-slate-400 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(notif.createdAt).toLocaleString()}
                  </div>
                </div>

                {!notif.read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    title="Mark as read"
                    className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                  >
                    <MailOpen size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
