const axios = require('axios');
const cheerio = require('cheerio');

class AIService {
  constructor() {
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ]);
  }

  // Extract content from URL
  async extractContent(url) {
    try {
      const response = await axios.get(url, {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract basic metadata
      const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
      const description = $('meta[name="description"]').attr('content') || 
                         $('meta[property="og:description"]').attr('content') || '';
      const image = $('meta[property="og:image"]').attr('content') || '';

      // Extract main content
      const content = this.extractMainContent($);
      
      // Generate insights
      const insights = this.generateInsights(content.text, title, $);

      return {
        title: title,
        description: description,
        image: image,
        content: content.text,
        ...insights
      };
    } catch (error) {
      console.error('Error extracting content:', error.message);
      return {
        title: '',
        description: '',
        image: '',
        content: '',
        keywords: [],
        readTime: 1,
        contentType: 'unknown',
        complexity: 0.5,
        wordCount: 0,
        summary: 'Unable to analyze content',
        sentiment: 'neutral'
      };
    }
  }

  // Extract main content from HTML
  extractMainContent($) {
    // Remove unwanted elements
    $('script, style, nav, header, footer, .nav, .header, .footer, .sidebar, .menu, .ad, .advertisement').remove();
    
    // Try to find main content areas
    const selectors = [
      'main',
      'article',
      '.content',
      '.post',
      '.entry',
      '#content',
      '#main',
      '.main-content',
      '.post-content',
      '.article-content'
    ];

    let content = '';
    let headings = [];

    // Try to find main content
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        headings = this.extractHeadings(element);
        break;
      }
    }

    // If no main content found, use body
    if (!content) {
      content = $('body').text();
      headings = this.extractHeadings($('body'));
    }

    // Clean up content
    content = this.cleanText(content);
    const wordCount = this.countWords(content);

    return {
      text: content,
      wordCount: wordCount,
      headings: headings
    };
  }

  // Extract headings
  extractHeadings($element) {
    const headings = [];
    $element.find('h1, h2, h3, h4, h5, h6').each((i, el) => {
      headings.push({
        level: el.name,
        text: $element.find(el).text().trim()
      });
    });
    return headings.slice(0, 5); // Limit to first 5 headings
  }

  // Clean text content
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim()
      .substring(0, 5000); // Limit to 5k characters
  }

  // Count words
  countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  // Generate insights from content
  generateInsights(text, title, $) {
    const wordCount = this.countWords(text);
    const keywords = this.extractKeywords(text);
    const readTime = this.calculateReadTime(wordCount);
    const contentType = this.determineContentType(text, title, $);
    const complexity = this.calculateComplexity(text);
    const summary = this.generateSummary(text);
    const sentiment = this.analyzeSentiment(text);

    return {
      keywords: keywords,
      readTime: readTime,
      contentType: contentType,
      complexity: complexity,
      wordCount: wordCount,
      summary: summary,
      sentiment: sentiment
    };
  }

  // Extract keywords using frequency analysis
  extractKeywords(text, maxKeywords = 8) {
    if (!text || text.length < 50) return [];

    // Tokenize and clean words
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.stopWords.has(word));

    // Count word frequency
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Sort by frequency and return top keywords
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  // Calculate read time in minutes
  calculateReadTime(wordCount) {
    const wordsPerMinute = 200;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, Math.min(readTime, 30)); // Between 1 and 30 minutes
  }

  // Calculate text complexity (0-1 scale)
  calculateComplexity(text) {
    if (!text) return 0.5;

    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (words.length === 0 || sentences.length === 0) return 0.5;

    // Average word length
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Average sentence length
    const avgSentenceLength = words.length / sentences.length;
    
    // Calculate complexity score
    const wordComplexity = Math.min(avgWordLength / 8, 1);
    const sentenceComplexity = Math.min(avgSentenceLength / 25, 1);
    
    return Math.min((wordComplexity + sentenceComplexity) / 2, 1);
  }

  // Determine content type
  determineContentType(text, title, $) {
    const lowerText = (text + ' ' + title).toLowerCase();
    
    // Check for specific content types
    if (lowerText.includes('news') || lowerText.includes('article')) return 'news';
    if (lowerText.includes('tutorial') || lowerText.includes('guide') || lowerText.includes('how to')) return 'tutorial';
    if (lowerText.includes('documentation') || lowerText.includes('api') || lowerText.includes('reference')) return 'documentation';
    if (lowerText.includes('blog') || lowerText.includes('post')) return 'blog';
    if ($('video').length > 0 || lowerText.includes('video')) return 'video';
    if ($('img').length > 5 || lowerText.includes('image')) return 'image';
    if (lowerText.includes('product') || lowerText.includes('buy') || lowerText.includes('price')) return 'product';
    if (lowerText.includes('resume') || lowerText.includes('cv')) return 'resume';
    if (lowerText.includes('job') || lowerText.includes('career') || lowerText.includes('employment')) return 'job';
    
    return 'general';
  }

  // Generate simple summary
  generateSummary(text, maxLength = 150) {
    if (!text || text.length < maxLength) return text;

    // Split into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) return text.substring(0, maxLength) + '...';

    // Take first few sentences that fit within maxLength
    let summary = '';
    for (const sentence of sentences) {
      if ((summary + sentence).length < maxLength) {
        summary += sentence + '. ';
      } else {
        break;
      }
    }

    return summary.trim() || text.substring(0, maxLength) + '...';
  }

  // Analyze content sentiment (basic)
  analyzeSentiment(text) {
    if (!text) return 'neutral';

    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'best', 'love', 'like', 'happy', 'success', 'awesome', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'hate', 'dislike', 'sad', 'fail', 'error', 'problem', 'horrible', 'disappointing'];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Check for duplicate links (simplified)
  async checkDuplicates(newUrl, existingLinks) {
    if (!existingLinks || existingLinks.length === 0) {
      return { isDuplicate: false, similarity: 0, similarLink: null };
    }

    try {
      const newUrlDomain = new URL(newUrl).hostname;
      let maxSimilarity = 0;
      let mostSimilarLink = null;

      for (const link of existingLinks) {
        try {
          const existingUrlDomain = new URL(link.url).hostname;
          
          // Check domain similarity
          const domainSimilarity = this.calculateSimilarity(newUrlDomain, existingUrlDomain);
          
          // Check title similarity if available
          let titleSimilarity = 0;
          if (link.name && link.name.length > 0) {
            titleSimilarity = this.calculateSimilarity(newUrl.toLowerCase(), link.name.toLowerCase());
          }

          // Calculate overall similarity
          const overallSimilarity = (domainSimilarity * 0.6) + (titleSimilarity * 0.4);

          if (overallSimilarity > maxSimilarity) {
            maxSimilarity = overallSimilarity;
            mostSimilarLink = link;
          }
        } catch (error) {
          // Skip invalid URLs
          continue;
        }
      }

      return {
        isDuplicate: maxSimilarity > 0.8, // Higher threshold for simplified detection
        similarity: maxSimilarity,
        similarLink: mostSimilarLink
      };
    } catch (error) {
      return { isDuplicate: false, similarity: 0, similarLink: null };
    }
  }

  // Calculate similarity between two strings
  calculateSimilarity(str1, str2) {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // Levenshtein distance for similarity calculation
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

module.exports = new AIService(); 