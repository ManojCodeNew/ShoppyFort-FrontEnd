import React from 'react';
import './styles/statCard.css'; 

export default function StatCard({ title, value, change, isPositive, Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div>
          <p className="stat-card-title">{title}</p>
          <h3 className="stat-card-value">{value}</h3>
        </div>
        <div className={`stat-card-icon-container ${isPositive ? 'positive' : 'negative'}`}>
          <Icon className={`stat-card-icon ${isPositive ? 'positive' : 'negative'}`} />
        </div>
      </div>
      <div className="stat-card-footer">
        <span className={`stat-card-change ${isPositive ? 'positive' : 'negative'}`}>
          {change}
        </span>
        <span className="stat-card-footer-text">vs last month</span>
      </div>
    </div>
  );
}
