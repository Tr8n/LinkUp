import { useState, useEffect } from 'react';
import { linksAPI } from '../services/api';
import './Main.css';

const Main = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    tags: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await linksAPI.getAll();
      setLinks(response.data);
    } catch (err) {
      setError('Failed to fetch links');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) {
      setError('Name and URL are required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const linkData = {
        name: formData.name.trim(),
        url: formData.url.trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editingId) {
        await linksAPI.update(editingId, linkData);
        setEditingId(null);
      } else {
        await linksAPI.create(linkData);
      }

      setFormData({ name: '', url: '', tags: '' });
      await fetchLinks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save link');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (link) => {
    setEditingId(link._id);
    setFormData({
      name: link.name,
      url: link.url,
      tags: link.tags.join(', ')
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this link?')) {
      return;
    }

    try {
      setError('');
      await linksAPI.delete(id);
      await fetchLinks();
    } catch (err) {
      setError('Failed to delete link');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', url: '', tags: '' });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your links...</p>
      </div>
    );
  }

  return (
    <div className="main-page">
      <div className="container">
        <div className="main-card">
          <div className="card-header">
            <h1 className="main-title">
              {editingId ? 'Edit Link' : 'Add New Link'}
            </h1>
            <p className="main-subtitle">
              {editingId ? 'Update your link information below.' : 'Add a new link to your collection.'}
            </p>
          </div>

          <div className="card-body">
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form className="link-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Link Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Enter link name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="url" className="form-label">
                  URL *
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tags" className="form-label">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="tag1, tag2, tag3"
                />
                <p className="form-help">Separate tags with commas</p>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Saving...' : (editingId ? 'Update Link' : 'Add Link')}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="links-section">
              <h2 className="links-title">
                Your Links ({links.length})
              </h2>
              
              {links.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-text">No links yet. Add your first link above!</p>
                </div>
              ) : (
                <div className="links-list">
                  {links.map((link) => (
                    <div key={link._id} className="link-item">
                      <div className="link-content">
                        <div className="link-info">
                          <h3 className="link-name">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link-url"
                            >
                              {link.name}
                            </a>
                          </h3>
                          <p className="link-address">
                            {link.url}
                          </p>
                          {link.tags && link.tags.length > 0 && (
                            <div className="link-tags">
                              {link.tags.map((tag, index) => (
                                <span key={index} className="tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="link-date">
                            Created: {new Date(link.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="link-actions">
                          <button
                            onClick={() => handleEdit(link)}
                            className="btn btn-secondary btn-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(link._id)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
