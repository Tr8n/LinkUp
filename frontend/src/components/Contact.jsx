import React, { useState } from 'react';
import './Contact.css';

const Contact = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('features');

  const features = [
    {
      icon: '🔐',
      title: 'Secure Authentication',
      description: 'JWT-based authentication with user UID for secure access to your personal link vault.'
    },
    {
      icon: '🏷️',
      title: 'Smart Organization',
      description: 'Categorize links with color tags and categories like Resume, Job, Work, Personal, Study, and more.'
    },
    {
      icon: '⭐',
      title: 'Favorites System',
      description: 'Mark important links as favorites for quick access and better organization.'
    },
    {
      icon: '🔍',
      title: 'Advanced Search',
      description: 'Search through your links by name, description, or tags for instant results.'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'View statistics about your links including total count, favorites, and category breakdown.'
    },
    {
      icon: '🌙',
      title: 'Dark Mode',
      description: 'Toggle between light and dark themes for comfortable viewing in any environment.'
    }
  ];

  const categories = [
    { name: 'Resume', icon: '📄', color: 'blue', description: 'Professional resumes and CVs' },
    { name: 'Job', icon: '💼', color: 'green', description: 'Job applications and career resources' },
    { name: 'Work', icon: '💻', color: 'purple', description: 'Work-related tools and resources' },
    { name: 'Personal', icon: '👤', color: 'pink', description: 'Personal websites and social media' },
    { name: 'Study', icon: '📚', color: 'orange', description: 'Educational resources and study materials' },
    { name: 'Favorite', icon: '⭐', color: 'yellow', description: 'Your most important bookmarks' },
    { name: 'Other', icon: '🔗', color: 'gray', description: 'Miscellaneous links and resources' }
  ];

  const colorTags = [
    { name: 'Red', color: 'red', description: 'High priority or urgent links' },
    { name: 'Orange', color: 'orange', description: 'Important but not urgent' },
    { name: 'Yellow', color: 'yellow', description: 'Medium priority items' },
    { name: 'Green', color: 'green', description: 'Completed or reference items' },
    { name: 'Blue', color: 'blue', description: 'Default category color' },
    { name: 'Purple', color: 'purple', description: 'Creative or personal projects' },
    { name: 'Pink', color: 'pink', description: 'Social or entertainment links' },
    { name: 'Gray', color: 'gray', description: 'Neutral or miscellaneous items' }
  ];

  return (
    <div className="contact-overlay" onClick={onClose}>
      <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
        <div className="contact-header">
          <h2>LinkVault - Your Personal Link Manager</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="contact-tabs">
          <button 
            className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            Features
          </button>
          <button 
            className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button 
            className={`tab-btn ${activeTab === 'colors' ? 'active' : ''}`}
            onClick={() => setActiveTab('colors')}
          >
            Color Tags
          </button>
          <button 
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>

        <div className="contact-content">
          {activeTab === 'features' && (
            <div className="features-section">
              <p className="section-description">
                LinkVault is a modern, secure link management application built with the MERN stack. 
                Organize your digital life with powerful features designed for productivity.
              </p>
              <div className="features-grid">
                {features.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <div className="feature-icon">{feature.icon}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="categories-section">
              <p className="section-description">
                Organize your links into meaningful categories for better navigation and management.
              </p>
              <div className="categories-grid">
                {categories.map((category, index) => (
                  <div key={index} className="category-card">
                    <div className="category-icon">{category.icon}</div>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="colors-section">
              <p className="section-description">
                Use color tags to visually organize and prioritize your links, similar to iOS file system.
              </p>
              <div className="colors-grid">
                {colorTags.map((tag, index) => (
                  <div key={index} className="color-card">
                    <div className={`color-dot color-${tag.color}`}></div>
                    <h3>{tag.name}</h3>
                    <p>{tag.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="about-section">
              <div className="about-content">
                <h3>About LinkVault</h3>
                <p>
                  LinkVault is a full-stack web application built with modern technologies to provide 
                  a secure and efficient way to manage your digital bookmarks and links.
                </p>
                
                <h4>Technology Stack</h4>
                <ul>
                  <li><strong>Frontend:</strong> React.js with modern hooks and functional components</li>
                  <li><strong>Backend:</strong> Node.js with Express.js framework</li>
                  <li><strong>Database:</strong> MongoDB with Mongoose ODM</li>
                  <li><strong>Authentication:</strong> JWT (JSON Web Tokens)</li>
                  <li><strong>Styling:</strong> Custom CSS with CSS variables for theming</li>
                </ul>

                <h4>Key Features</h4>
                <ul>
                  <li>Secure user authentication with JWT</li>
                  <li>CRUD operations for link management</li>
                  <li>Category-based organization</li>
                  <li>Color-coded tagging system</li>
                  <li>Favorites and search functionality</li>
                  <li>Responsive design for all devices</li>
                  <li>Dark/Light mode toggle</li>
                  <li>Real-time statistics and analytics</li>
                </ul>

                <h4>Getting Started</h4>
                <ol>
                  <li>Create an account using your unique UID</li>
                  <li>Start adding your important links</li>
                  <li>Organize them with categories and color tags</li>
                  <li>Use the sidebar to navigate between categories</li>
                  <li>Mark your most important links as favorites</li>
                  <li>Use the search function to find links quickly</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact; 