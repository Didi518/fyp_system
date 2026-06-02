import { useEffect } from 'react';
import {
  AlertCircleIcon,
  BadgeCheckIcon,
  BellOffIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  Clock5Icon,
  ClockIcon,
  MessageCircleIcon,
  SettingsIcon,
  UserIcon,
} from 'lucide-react';

import { useNotification } from '../../hooks';
import {
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_TYPES,
} from '../../constants/constants';

const NotificationsPage = () => {
  const {
    deleteNotification,
    getNotifications,
    markAllAsRead,
    markAsRead,
    highPriorityMessages: important = 0,
    thisWeekNotifications: recent = 0,
    notifications,
    unreadCount,
  } = useNotification();

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  const markAsReadHandler = (id) => {
    markAsRead(id);
  };

  const markAllAsReadHandler = () => {
    markAllAsRead();
  };

  const deleteNotificationHandler = (id) => {
    deleteNotification(id);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'feedback':
        return <MessageCircleIcon className="h-6 w-6 text-blue-500" />;
      case 'deadline':
        return <Clock5Icon className="h-6 w-6 text-red-500" />;
      case 'approval':
        return <BadgeCheckIcon className="h-6 w-6 text-green-500" />;
      case 'meeting':
        return <CalendarIcon className="h-6 w-6 text-purple-500" />;
      case 'system':
        return <SettingsIcon className="h-6 w-6 text-gray-500" />;

      default:
        return (
          <div className="relative w-6 h-6 text-slate-500 flex items-center justify-center">
            <UserIcon className="h-5 w-5 absolute" />
            <ChevronDownIcon className="h-4 w-4 absolute top-4" />
          </div>
        );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-1-red-500';
      case 'medium':
        return 'border-1-yellow-500';
      case 'low':
        return 'border-1-green-500';

      default:
        return 'border-1-slate-300';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'hier';
    } else if (diffDays <= 7) {
      return `il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const stats = [
    {
      title: 'Total',
      value: notifications?.length ?? 0,
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      textColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      valueColor: 'text-blue-900',
      Icon: UserIcon,
    },
    {
      title: 'Non lues',
      value: unreadCount ?? 0,
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      textColor: 'text-red-600',
      titleColor: 'text-red-800',
      valueColor: 'text-red-900',
      Icon: AlertCircleIcon,
    },
    {
      title: 'Importantes',
      value: important ?? 0,
      bg: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      valueColor: 'text-yellow-900',
      Icon: ClockIcon,
    },
    {
      title: 'Cette semaine',
      value: recent ?? 0,
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      textColor: 'text-green-600',
      titleColor: 'text-green-800',
      valueColor: 'text-green-900',
      Icon: CheckCircleIcon,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="card-title">Notifications</h1>
                <p className="card-subtitle">
                  Reste à jour sur ton projet et tes dates limites
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  className="btn-outline btn-small"
                  onClick={markAllAsReadHandler}
                >
                  Tout marquer comme lue(s) ({unreadCount})
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((item) => {
              return (
                <div key={item.title} className={`${item.bg} rounded-lg p-4`}>
                  <div className="flex items-center">
                    <div className={`p-2 ${item.iconBg} rounded-lg`}>
                      <item.Icon className={`w-5 h-5 ${item.textColor}`} />
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${item.titleColor}`}>
                        {item.title}
                      </p>
                      <p className={`text-sm font-medium ${item.valueColor}`}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="space-y-3">
            {notifications.map((notification) => {
              return (
                <div
                  key={notification._id}
                  className={`border border-slate-200 rounded-lg p-4 transition-all duration-200 ${getPriorityColor(notification.priority)} ${!notification.isRead ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`font-medium ${!notification.isRead ? 'text-slate-900' : 'text-slate-700'}`}
                        >
                          {notification.title}{' '}
                          {!notification.isRead && (
                            <span className="ml-2 w-2 h-2 bg-blue-50 rounded-full inline-block" />
                          )}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-500">
                            {formatDate(notification.createdAt)}
                          </span>
                          <span
                            className={`badge capitalize ${notification.priority === 'high' ? 'badge-rejected' : notification.priority === 'medium' ? 'badge-pending' : 'badge-approved'}`}
                          >
                            {NOTIFICATION_PRIORITIES[notification.priority] ??
                              notification.priority}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed mb-3">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`badge capitalize ${notification.type === 'feedback' ? 'bg-blue-100 text-blue-800' : notification.type === 'deadline' ? 'bg-red-100 text-red-800' : notification.type === 'approval' ? 'bg-green-100 text-green-800' : notification.type === 'meeting' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {NOTIFICATION_TYPES[notification.type] ??
                            notification.type}
                        </span>
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <button
                              className="text-sm text-blue-600 hover:text-blue-500"
                              onClick={() =>
                                markAsReadHandler(notification._id)
                              }
                            >
                              Marquer comme lue
                            </button>
                          )}
                          <button
                            className="text-sm text-red-600 hover:text-red-500"
                            onClick={() =>
                              deleteNotificationHandler(notification._id)
                            }
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {notifications.length === 0 && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-3 text-slate-600">
                <BellOffIcon className="w-12 h-12" />
              </div>
              <p className="text-slate-500">
                Aucune Notification Pour le Moment
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
