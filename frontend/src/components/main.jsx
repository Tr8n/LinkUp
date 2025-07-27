import React, { useState, useEffect } from 'react';
import { linksAPI } from '../services/api';
import Sidebar from './Sidebar';
import Contact from './Contact';
import './Main.css';

const Main = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [complexityFilter, setComplexityFilter] = useState('all');
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    category: 'other',
    colorTag: 'blue',
    tags: '',
    isFavorite: false
  });

  useEffect(() => {
    fetchLinks();
  }, [selectedCategory, searchTerm, sortBy, sortOrder, contentTypeFilter, complexityFilter]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const params = {
        sortBy,
        sortOrder,
        search: searchTerm || undefined
      };

      if (selectedCategory === 'favorites') {
        params.favorite = 'true';
      } else if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (contentTypeFilter !== 'all') {
        params.contentType = contentTypeFilter;
      }

      if (complexityFilter !== 'all') {
        params.complexity = complexityFilter;
      }

      const response = await linksAPI.getAll(params);
      setLinks(response.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch links');
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const linkData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editingLink) {
        await linksAPI.update(editingLink._id, linkData);
        setEditingLink(null);
      } else {
        const response = await linksAPI.create(linkData);
        
        // Check for duplicate warning
        if (response.data.duplicateInfo && response.data.duplicateInfo.isDuplicate) {
          setDuplicateInfo(response.data.duplicateInfo);
          setShowDuplicateWarning(true);
          return;
        }
      }

      resetForm();
      fetchLinks();
    } catch (error) {
      if (error.response?.status === 409) {
        // Duplicate detected
        setDuplicateInfo(error.response.data.duplicateInfo);
        setShowDuplicateWarning(true);
      } else {
        setError('Failed to save link');
        console.error('Error saving link:', error);
      }
    }
  };

  const handleDuplicateConfirm = async () => {
    try {
      const linkData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await linksAPI.create(linkData);
      setShowDuplicateWarning(false);
      setDuplicateInfo(null);
      resetForm();
      fetchLinks();
    } catch (error) {
      setError('Failed to save link');
      console.error('Error saving link:', error);
    }
  };

  const handleEdit = (link) => {
    setEditingLink(link);
    setFormData({
      name: link.name,
      url: link.url,
      description: link.description || '',
      category: link.category,
      colorTag: link.colorTag,
      tags: link.tags.join(', '),
      isFavorite: link.isFavorite
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await linksAPI.delete(id);
        fetchLinks();
      } catch (error) {
        setError('Failed to delete link');
        console.error('Error deleting link:', error);
      }
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await linksAPI.toggleFavorite(id);
      fetchLinks();
    } catch (error) {
      setError('Failed to toggle favorite');
      console.error('Error toggling favorite:', error);
    }
  };

  const handleReanalyze = async (id) => {
    try {
      await linksAPI.reanalyze(id);
      // Wait a bit for analysis to complete, then refresh
      setTimeout(() => {
        fetchLinks();
      }, 2000);
    } catch (error) {
      setError('Failed to re-analyze link');
      console.error('Error re-analyzing link:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      description: '',
      category: 'other',
      colorTag: 'blue',
      tags: '',
      isFavorite: false
    });
    setShowForm(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
    if (complexity < 0.3) return 'green';
    if (complexity < 0.7) return 'orange';
    return 'red';
  };

  return (
    <div className="main-container">
      {/* Sidebar */}
      <Sidebar 
        onCategorySelect={setSelectedCategory}
        selectedCategory={selectedCategory}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isOpen={sidebarOpen}
      />

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Header */}
        <div className="main-header">
          <div className="header-left">
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1>LinkVault</h1>
            <p>Organize your digital life with smart link management</p>
          </div>
          <div className="header-right">
            <button className="btn btn-secondary" onClick={() => setShowContact(true)}>
              ℹ️ About
            </button>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              ➕ Add Link
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search links, keywords, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filters">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="aiAnalysis.readTime">Read Time</option>
              <option value="aiAnalysis.complexity">Complexity</option>
            </select>
            
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="filter-select"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>

            <select 
              value={contentTypeFilter} 
              onChange={(e) => setContentTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="news">📰 News</option>
              <option value="tutorial">📚 Tutorial</option>
              <option value="documentation">📖 Documentation</option>
              <option value="blog">✍️ Blog</option>
              <option value="video">🎥 Video</option>
              <option value="image">🖼️ Image</option>
              <option value="product">🛍️ Product</option>
              <option value="general">🔗 General</option>
            </select>

            <select 
              value={complexityFilter} 
              onChange={(e) => setComplexityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Complexity</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="complex">Complex</option>
            </select>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="form-overlay">
            <div className="form-modal">
              <div className="form-header">
                <h2>{editingLink ? 'Edit Link' : 'Add New Link'}</h2>
                <button className="close-btn" onClick={resetForm}>✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="link-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>URL *</label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="form-textarea"
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="form-select"
                    >
                      <option value="resume">📄 Resume</option>
                      <option value="job">💼 Job</option>
                      <option value="work">💻 Work</option>
                      <option value="personal">👤 Personal</option>
                      <option value="study">📚 Study</option>
                      <option value="other">🔗 Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Color Tag</label>
                    <div className="color-tag-selector">
                      {['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'].map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`color-option ${formData.colorTag === color ? 'selected' : ''}`}
                          onClick={() => setFormData({...formData, colorTag: color})}
                        >
                          <div className={`color-dot color-${color}`}></div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="form-input"
                    placeholder="work, important, reference"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isFavorite}
                      onChange={(e) => setFormData({...formData, isFavorite: e.target.checked})}
                      className="form-checkbox"
                    />
                    Mark as Favorite
                  </label>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingLink ? 'Update Link' : 'Add Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Duplicate Warning Modal */}
        {showDuplicateWarning && (
          <div className="form-overlay">
            <div className="form-modal">
              <div className="form-header">
                <h2>⚠️ Potential Duplicate Detected</h2>
                <button className="close-btn" onClick={() => setShowDuplicateWarning(false)}>✕</button>
              </div>
              
              <div className="duplicate-warning">
                <p>This link appears to be similar to an existing link in your collection.</p>
                <div className="similarity-info">
                  <p><strong>Similarity Score:</strong> {Math.round(duplicateInfo.similarity * 100)}%</p>
                  {duplicateInfo.similarLink && (
                    <div className="similar-link">
                      <p><strong>Similar to:</strong></p>
                      <div className="similar-link-card">
                        <h4>{duplicateInfo.similarLink.name}</h4>
                        <p>{duplicateInfo.similarLink.url}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowDuplicateWarning(false)} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleDuplicateConfirm} 
                    className="btn btn-primary"
                  >
                    Add Anyway
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Links List */}
        <div className="links-container">
          {loading ? (
            <div className="loading">Loading links...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : links.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔗</div>
              <h3>No links found</h3>
              <p>Start by adding your first link to get organized!</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                Add Your First Link
              </button>
            </div>
          ) : (
            <div className="links-grid">
              {links.map((link) => (
                <div key={link._id} className="link-card">
                  <div className="link-header">
                    <div className="link-meta">
                      <span className="category-icon">{getCategoryIcon(link.category)}</span>
                      <span className="category-name">{link.category}</span>
                      <div className={getColorTagClass(link.colorTag)}></div>
                    </div>
                    <div className="link-actions">
                      <button
                        onClick={() => handleToggleFavorite(link._id)}
                        className={`favorite-btn ${link.isFavorite ? 'favorited' : ''}`}
                        title={link.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {link.isFavorite ? '⭐' : '☆'}
                      </button>
                      <button
                        onClick={() => handleEdit(link)}
                        className="edit-btn"
                        title="Edit link"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleReanalyze(link._id)}
                        className="reanalyze-btn"
                        title="Re-analyze with AI"
                      >
                        🤖
                      </button>
                      <button
                        onClick={() => handleDelete(link._id)}
                        className="delete-btn"
                        title="Delete link"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="link-content">
                    <h3 className="link-title">{link.name}</h3>
                    {link.description && (
                      <p className="link-description">{link.description}</p>
                    )}
                    {link.aiAnalysis?.summary && (
                      <p className="link-summary">{link.aiAnalysis.summary}</p>
                    )}
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="link-url"
                    >
                      {link.url}
                    </a>
                  </div>

                  {/* AI Analysis Info */}
                  {link.aiAnalysis && (
                    <div className="ai-analysis">
                      <div className="ai-stats">
                        {link.aiAnalysis.readTime > 0 && (
                          <span className="ai-stat read-time">
                            ⏱️ {link.readTimeDisplay}
                          </span>
                        )}
                        {link.aiAnalysis.contentType && link.aiAnalysis.contentType !== 'unknown' && (
                          <span className="ai-stat content-type">
                            {getContentTypeIcon(link.aiAnalysis.contentType)} {link.aiAnalysis.contentType}
                          </span>
                        )}
                        {link.aiAnalysis.complexity > 0 && (
                          <span className={`ai-stat complexity complexity-${getComplexityColor(link.aiAnalysis.complexity)}`}>
                            📊 {link.complexityDisplay}
                          </span>
                        )}
                        {link.aiAnalysis.wordCount > 0 && (
                          <span className="ai-stat word-count">
                            📝 {link.aiAnalysis.wordCount} words
                          </span>
                        )}
                      </div>
                      
                      {link.aiAnalysis.keywords && link.aiAnalysis.keywords.length > 0 && (
                        <div className="ai-keywords">
                          <span className="keywords-label">Keywords:</span>
                          {link.aiAnalysis.keywords.slice(0, 5).map((keyword, index) => (
                            <span key={index} className="keyword">{keyword}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {link.tags && link.tags.length > 0 && (
                    <div className="link-tags">
                      {link.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="link-footer">
                    <span className="link-date">Added: {formatDate(link.createdAt)}</span>
                    {link.aiAnalysis?.lastAnalyzed && (
                      <span className="analysis-date">
                        Analyzed: {formatDate(link.aiAnalysis.lastAnalyzed)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <Contact onClose={() => setShowContact(false)} />
      )}
    </div>
  );
};

export default Main;
