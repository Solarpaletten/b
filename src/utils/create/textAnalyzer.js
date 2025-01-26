const natural = require('natural');
const { removeStopwords } = require('stopword');
const { logger } = require('../config/logger');

class TextAnalyzer {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.tfidf = new natural.TfIdf();
    
    // Инициализация классификатора
    this.classifier = new natural.BayesClassifier();
  }

  // Токенизация текста
  tokenize(text) {
    try {
      return this.tokenizer.tokenize(text.toLowerCase());
    } catch (error) {
      logger.error('Tokenization error:', error);
      throw error;
    }
  }

  // Удаление стоп-слов
  removeStopwords(tokens, lang = 'en') {
    try {
      return removeStopwords(tokens, lang);
    } catch (error) {
      logger.error('Stopword removal error:', error);
      throw error;
    }
  }

  // Стемминг слов
  stem(tokens) {
    try {
      return tokens.map(token => this.stemmer.stem(token));
    } catch (error) {
      logger.error('Stemming error:', error);
      throw error;
    }
  }

  // Анализ тональности текста
  async analyzeSentiment(text) {
    try {
      const analyzer = new natural.SentimentAnalyzer(
        'English',
        this.stemmer,
        'afinn'
      );
      const tokens = this.tokenize(text);
      const stems = this.stem(tokens);
      const score = analyzer.getSentiment(stems);

      return {
        score,
        sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
      };
    } catch (error) {
      logger.error('Sentiment analysis error:', error);
      throw error;
    }
  }

  // Извлечение ключевых слов
  extractKeywords(text, options = {}) {
    try {
      const tokens = this.tokenize(text);
      const withoutStopwords = this.removeStopwords(tokens);
      const stems = this.stem(withoutStopwords);

      this.tfidf.addDocument(stems);
      const terms = this.tfidf.listTerms(0);

      return terms
        .slice(0, options.limit || 10)
        .map(term => ({
          word: term.term,
          score: term.tfidf
        }));
    } catch (error) {
      logger.error('Keyword extraction error:', error);
      throw error;
    }
  }

  // Обучение классификатора
  trainClassifier(data) {
    try {
      data.forEach(item => {
        this.classifier.addDocument(item.text, item.category);
      });
      this.classifier.train();
    } catch (error) {
      logger.error('Classifier training error:', error);
      throw error;
    }
  }

  // Классификация текста
  classify(text) {
    try {
      return this.classifier.classify(text);
    } catch (error) {
      logger.error('Classification error:', error);
      throw error;
    }
  }

  // Поиск похожих текстов
  findSimilar(texts, query, options = {}) {
    try {
      const queryTokens = this.stem(
        this.removeStopwords(
          this.tokenize(query)
        )
      );

      return texts
        .map(text => {
          const tokens = this.stem(
            this.removeStopwords(
              this.tokenize(text)
            )
          );
          const similarity = natural.JaroWinklerDistance(
            queryTokens.join(' '),
            tokens.join(' '),
            options
          );
          return { text, similarity };
        })
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, options.limit || 5);
    } catch (error) {
      logger.error('Similarity search error:', error);
      throw error;
    }
  }

  // Суммаризация текста
  summarize(text, options = {}) {
    try {
      const sentences = natural.SentenceTokenizer.tokenize(text);
      const tokens = sentences.map(sentence => 
        this.stem(
          this.removeStopwords(
            this.tokenize(sentence)
          )
        )
      );

      // Вычисляем важность предложений
      const importance = sentences.map((sentence, i) => {
        const words = tokens[i];
        return {
          sentence,
          score: words.length ? this.tfidf.tfidf(words.join(' '), 0) : 0
        };
      });

      // Возвращаем наиболее важные предложения
      return importance
        .sort((a, b) => b.score - a.score)
        .slice(0, options.sentences || 3)
        .map(item => item.sentence)
        .join(' ');
    } catch (error) {
      logger.error('Summarization error:', error);
      throw error;
    }
  }
}

module.exports = new TextAnalyzer(); 