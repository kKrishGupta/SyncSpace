import React, { useState, useEffect } from 'react';
import { activityService } from '../services/activityService';
import { formatDistanceToNow } from 'date-fns';

const ActivityFeed = ({ workspaceId, projectId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        let res;
        if (projectId) {
          res = await activityService.getProjectActivity(projectId);
        } else if (workspaceId) {
          res = await activityService.getWorkspaceActivity(workspaceId);
        }
        if (res) setActivities(res.data);
      } catch (error) {
        console.error("Failed to fetch activity", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (workspaceId || projectId) {
      fetchActivities();
    }
  }, [workspaceId, projectId]);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-3">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>;
  }

  if (activities.length === 0) {
    return <div className="text-gray-500 text-sm text-center py-4">No recent activity.</div>;
  }

  const getActionText = (activity) => {
    const { action, entityType, metadata } = activity;
    const actorName = activity.actorId?.name || 'Someone';
    
    switch (action) {
      case 'CREATED':
        return <span><span className="font-medium text-gray-900 dark:text-gray-100">{actorName}</span> created a new {entityType.toLowerCase()} {metadata?.title ? `"${metadata.title}"` : ''}</span>;
      case 'MOVED':
        return <span><span className="font-medium text-gray-900 dark:text-gray-100">{actorName}</span> moved a {entityType.toLowerCase()} to {metadata?.status}</span>;
      case 'COMMENTED':
        return <span><span className="font-medium text-gray-900 dark:text-gray-100">{actorName}</span> commented on a {entityType.toLowerCase()}</span>;
      case 'ASSIGNED':
        return <span><span className="font-medium text-gray-900 dark:text-gray-100">{actorName}</span> assigned a {entityType.toLowerCase()}</span>;
      default:
        return <span><span className="font-medium text-gray-900 dark:text-gray-100">{actorName}</span> performed {action} on {entityType}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div key={activity._id} className="flex gap-3 text-sm">
          <div className="flex-shrink-0">
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                {activity.actorId?.name?.charAt(0) || '?'}
             </div>
          </div>
          <div className="flex-1">
            <p className="text-gray-700 dark:text-gray-300">
              {getActionText(activity)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
