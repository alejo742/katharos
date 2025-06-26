import React from 'react';
import { SvgIconComponent } from '@mui/icons-material';
import './AdminCard.css';

interface Statistic {
  label: string;
  value: number | string;
  loading?: boolean;
}

interface Action {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

interface AdminCardProps {
  title: string;
  icon: SvgIconComponent;
  statistics: Statistic[];
  actions: Action[];
  type: 'products' | 'orders' | 'users';
}

const AdminCard: React.FC<AdminCardProps> = ({
  title,
  icon: Icon,
  statistics,
  actions,
  type
}) => {
  return (
    <div className={`admin-card ${type}`}>
      <div className="admin-card-header">
        <Icon className="admin-card-icon" />
        <h3>{title}</h3>
      </div>
      
      <div className="admin-card-body">
        <div className="admin-card-stats">
          {statistics.map((stat, index) => (
            <div key={index} className="admin-stat">
              {stat.loading ? (
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              ) : (
                <>
                  <span className="admin-stat-value">{stat.value}</span>
                  <span className="admin-stat-label">{stat.label}</span>
                </>
              )}
            </div>
          ))}
        </div>
        
        <div className="admin-card-actions">
          {actions.map((action, index) => (
            <button 
              key={index}
              className={`admin-card-action ${action.primary ? 'primary' : 'secondary'}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCard;