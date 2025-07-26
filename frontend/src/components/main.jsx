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
  }, [selectedCategory, searchTerm, sortBy, sortOrder]);

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
        await linksAPI.create(linkData);
      }

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
              placeholder="Search links..."
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
            </select>
            
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="filter-select"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
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
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="link-url"
                    >
                      {link.url}
                    </a>
                  </div>
                  
                  {link.tags && link.tags.length > 0 && (
                    <div className="link-tags">
                      {link.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="link-footer">
                    <span className="link-date">Added: {formatDate(link.createdAt)}</span>
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
