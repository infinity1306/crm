import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Filter, 
  Sparkles, 
  ExternalLink,
  Shield,
  UserPlus,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';

export const NotificationCenter: React.FC = () => {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    clearAllNotifications, 
    navigateTo 
  } = useCRM();

  const [activeCategory, setActiveCategory] = useState<'all' | 'unread' | 'mentions' | 'system'>('all');

  const filteredNotifs = notifications.filter(n => {
    if (activeCategory === 'unread') return !n.isRead;
    if (activeCategory === 'mentions') return n.category === 'mentions';
    if (activeCategory === 'system') return n.category === 'system';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mentions':
        return <MessageSquare className="w-3.5 h-3.5 text-turquoise" />;
      case 'system':
        return <Shield className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-crm-textMuted" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-crm-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-crm-text">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-turquoise/20 text-turquoise border border-turquoise/30">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Operational alerts, team onboarding updates, and system mentions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CheckCheck className="w-3.5 h-3.5 text-turquoise" />}
              onClick={markAllNotificationsRead}
            >
              Mark all as read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-crm-textMuted" />}
            onClick={clearAllNotifications}
          >
            Clear all
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'all', label: 'All Notifications', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'mentions', label: 'Mentions' },
          { id: 'system', label: 'System & Security' },
        ]}
        activeTab={activeCategory}
        onChange={(id) => setActiveCategory(id as any)}
      />

      {/* Notifications List */}
      <Card className="p-0 overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="py-16 text-center text-xs text-crm-textMuted space-y-2">
            <Bell className="w-8 h-8 text-crm-textDim mx-auto stroke-1" />
            <p>No notifications found in this category.</p>
          </div>
        ) : (
          <div className="divide-y divide-crm-border/60">
            {filteredNotifs.map(notif => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationRead(notif.id);
                  if (notif.link) navigateTo(notif.link);
                }}
                className={`p-4 flex items-start gap-4 transition-colors cursor-pointer hover:bg-crm-surface/70 ${
                  !notif.isRead ? 'bg-turquoise-subtle/50' : 'bg-crm-card'
                }`}
              >
                <div className="p-2 rounded bg-crm-surface border border-crm-border mt-0.5">
                  {getCategoryIcon(notif.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-xs font-semibold ${!notif.isRead ? 'text-white' : 'text-crm-text'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] font-mono text-crm-textMuted flex-shrink-0">
                      {notif.createdAt}
                    </span>
                  </div>

                  <p className="text-xs text-crm-textSecondary mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-crm-surface text-crm-textMuted border border-crm-border">
                      {notif.category}
                    </span>
                    {notif.link && (
                      <span className="text-[11px] text-turquoise hover:text-turquoise-hover font-medium flex items-center gap-1">
                        <span>Open Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>

                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-turquoise flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
