import React, { useState, useEffect } from 'react';
import { linksAPI } from '../services/api';
import './Sidebar.css';

const Sidebar = ({ onCategorySelect, selectedCategory, onToggleSidebar, isOpen }) => {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  const fetchCategories = async () => {
    try {
      setError('');
      const response = await linksAPI.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
      setCategories([]);
    }
  };

  const fetchStats = async () => {
    try {
      setError('');
      const response = await linksAPI.getStats();
      setStats(response.data || {});
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load statistics');
      setStats({});
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      resume: '📄',
      job: '💼',
      favorite: '⭐',
      work: '💻',
      personal: '👤',
      study: '📚',
      other: '🔗'
    };
    return icons[category] || '🔗';
  };

  const getColorTagClass = (colorTag) => {
    return `color-tag color-tag-${colorTag}`;
  };

  const formatCategoryName = (categoryId) => {
    if (!categoryId) return 'Unknown';
    return categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
  };

  const formatReadTime = (minutes) => {
    if (minutes < 1) return 'Less than 1 min';
    if (minutes === 1) return '1 min';
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    if (remainingMins === 0) return `${hours}h`;
    return `${hours}h ${remainingMins}m`;
  };

  const getContentTypeIcon = (contentType) => {
    const icons = {
      news: '📰',
      tutorial: '📚',
      documentation: '📖',
      blog: '✍️',
      video: '🎥',
      image: '🖼️',
      product: '🛍️',
      general: '🔗',
      unknown: '❓'
    };
    return icons[contentType] || icons.unknown;
  };

  const getComplexityColor = (complexity) => {
    if (complexity === 'easy') return '#22c55e';
    if (complexity === 'medium') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>LinkVault</h3>
        <button className="close-btn" onClick={onToggleSidebar}>✕</button>
      </div>

      <div className="sidebar-content">
        {/* Stats Section */}
        <div className="stats-section">
          <h4>Overview</h4>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{stats.totalLinks || 0}</span>
                <span className="stat-label">Total Links</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.favoriteLinks || 0}</span>
                <span className="stat-label">Favorites</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.uniqueCategories || 0}</span>
                <span className="stat-label">Categories</span>
              </div>
              {stats.totalReadTime > 0 && (
                <div className="stat-item">
                  <span className="stat-number">{formatReadTime(stats.totalReadTime)}</span>
                  <span className="stat-label">Total Read Time</span>
                </div>
              )}
              {stats.totalWordCount > 0 && (
                <div className="stat-item">
                  <span className="stat-number">{(stats.totalWordCount / 1000).toFixed(1)}k</span>
                  <span className="stat-label">Total Words</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Insights Section */}
        {stats.contentTypeStats && stats.contentTypeStats.length > 0 && (
          <div className="ai-insights-section">
            <h4>Content Types</h4>
            <div className="content-type-stats">
              {stats.contentTypeStats.slice(0, 5).map((stat, index) => (
                <div key={index} className="content-type-item">
                  <span className="content-type-icon">
                    {getContentTypeIcon(stat._id)}
                  </span>
                  <span className="content-type-name">
                    {stat._id === 'unknown' ? 'Unknown' : stat._id}
                  </span>
                  <span className="content-type-count">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complexity Distribution */}
        {stats.complexityStats && stats.complexityStats.length > 0 && (
          <div className="complexity-section">
            <h4>Reading Complexity</h4>
            <div className="complexity-stats">
              {stats.complexityStats.map((stat, index) => (
                <div key={index} className="complexity-item">
                  <div className="complexity-bar">
                    <div
                      className="complexity-fill"
                      style={{
                        width: `${(stat.count / stats.totalLinks) * 100}%`,
                        backgroundColor: getComplexityColor(stat._id)
                      }}
                    ></div>
                  </div>
                  <span className="complexity-label">{stat._id}</span>
                  <span className="complexity-count">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Section */}
        <div className="categories-section">
          <h4>Categories</h4>
          <div className="category-list">
            <div
              className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => onCategorySelect('all')}
            >
              <span className="category-icon">📁</span>
              <span className="category-name">All Links</span>
              <span className="category-count">{stats.totalLinks || 0}</span>
            </div>

            <div
              className={`category-item ${selectedCategory === 'favorites' ? 'active' : ''}`}
              onClick={() => onCategorySelect('favorites')}
            >
              <span className="category-icon">⭐</span>
              <span className="category-name">Favorites</span>
              <span className="category-count">{stats.favoriteLinks || 0}</span>
            </div>

            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category._id || 'unknown'}
                  className={`category-item ${selectedCategory === category._id ? 'active' : ''}`}
                  onClick={() => onCategorySelect(category._id)}
                >
                  <span className="category-icon">{getCategoryIcon(category._id)}</span>
                  <span className="category-name">{formatCategoryName(category._id)}</span>
                  <div className="category-details">
                    <span className="category-count">{category.count || 0}</span>
                    {category.totalReadTime > 0 && (
                      <span className="category-read-time">
                        ⏱️ {formatReadTime(category.totalReadTime)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-categories">
                <span>No categories yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h4>Quick Actions</h4>
          <button className="action-btn" onClick={() => onCategorySelect('all')}>
            <span>🔍</span>
            View All
          </button>
          <button className="action-btn" onClick={() => onCategorySelect('favorites')}>
            <span>⭐</span>
            Favorites
          </button>
          <button className="action-btn" onClick={() => onCategorySelect('study')}>
            <span>📚</span>
            Study Links
          </button>
          <button className="action-btn" onClick={() => onCategorySelect('work')}>
            <span>💻</span>
            Work Links
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 