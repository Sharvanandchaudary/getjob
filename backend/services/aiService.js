const OpenAI = require('openai');
const axios = require('axios');
const cheerio = require('cheerio');
const pdfParse = require('pdf-parse');
const Job = require('../models/Job');
const User = require('../models/User');
const logger = require('../utils/logger');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class AIService {
  /**
   * Analyze resume and extract key information
   */
  async analyzeResume(resumeText, resumeFile = null) {
    try {
      let fullText = resumeText;
      
      // If PDF file is provided, parse it
      if (resumeFile) {
        const pdfBuffer = resumeFile.buffer;
        const pdfData = await pdfParse(pdfBuffer);
        fullText = pdfData.text;
      }
      
      const prompt = `Analyze this resume and extract structured information in JSON format:

Resume:
${fullText}

Please provide a JSON response with the following structure:
{
  "skills": ["list of technical and soft skills"],
  "experience": "brief summary of work experience (years and level)",
  "education": ["list of educational qualifications"],
  "summary": "2-3 sentence professional summary",
  "jobTitles": ["list of relevant job titles they might be interested in"],
  "preferredLocations": ["list of locations mentioned or inferred"],
  "experienceLevel": "entry|mid|senior|lead"
}`;

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert resume analyzer. Extract structured data from resumes accurately.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });
      
      const parsedData = JSON.parse(response.choices[0].message.content);
      
      return {
        success: true,
        data: {
          text: fullText,
          parsed: parsedData
        }
      };
    } catch (error) {
      logger.error('Resume analysis error:', error);
      throw new Error('Failed to analyze resume');
    }
  }
  
  /**
   * Find matching jobs for a user based on their resume and preferences
   */
  async findMatchingJobs(userId, limit = 20) {
    try {
      const user = await User.findById(userId);
      
      if (!user || !user.resume || !user.resume.parsedData) {
        throw new Error('User resume data not found');
      }
      
      const resumeData = user.resume.parsedData;
      const preferences = user.preferences || {};
      
      // Build search query
      const searchQuery = {
        isActive: true,
        $or: []
      };
      
      // Match by skills
      if (resumeData.skills && resumeData.skills.length > 0) {
        searchQuery.$or.push({
          skills: { $in: resumeData.skills.map(s => new RegExp(s, 'i')) }
        });
      }
      
      // Match by job titles
      if (resumeData.jobTitles && resumeData.jobTitles.length > 0) {
        searchQuery.$or.push({
          title: { $in: resumeData.jobTitles.map(t => new RegExp(t, 'i')) }
        });
      }
      
      // Match by preferred titles from user preferences
      if (preferences.jobTitles && preferences.jobTitles.length > 0) {
        searchQuery.$or.push({
          title: { $in: preferences.jobTitles.map(t => new RegExp(t, 'i')) }
        });
      }
      
      // If no OR conditions, fallback to text search
      if (searchQuery.$or.length === 0) {
        delete searchQuery.$or;
      }
      
      // Apply location filter if specified
      if (preferences.locations && preferences.locations.length > 0) {
        searchQuery.location = { $in: preferences.locations.map(l => new RegExp(l, 'i')) };
      }
      
      // Apply remote preference
      if (preferences.remotePreference && preferences.remotePreference !== 'any') {
        searchQuery.remote = preferences.remotePreference;
      }
      
      // Get jobs from database
      let jobs = await Job.find(searchQuery)
        .sort({ postedDate: -1 })
        .limit(limit * 2); // Get more than needed for scoring
      
      // If not enough jobs found, scrape from web
      if (jobs.length < 5) {
        logger.info(`Only ${jobs.length} jobs found in DB, scraping web...`);
        const scrapedJobs = await this.scrapeJobs(resumeData, preferences, 20);
        jobs = [...jobs, ...scrapedJobs];
      }
      
      // Calculate match scores using AI
      const scoredJobs = await this.calculateJobMatchScores(jobs, resumeData, preferences);
      
      // Sort by match score and return top matches
      const topMatches = scoredJobs
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
      
      // Update user's matched jobs
      await this.updateUserMatchedJobs(userId, topMatches);
      
      return {
        success: true,
        data: {
          jobs: topMatches,
          total: topMatches.length
        }
      };
    } catch (error) {
      logger.error('Job matching error:', error);
      throw new Error('Failed to find matching jobs');
    }
  }
  
  /**
   * Calculate match scores for jobs using AI
   */
  async calculateJobMatchScores(jobs, resumeData, preferences) {
    try {
      const batchSize = 5;
      const scoredJobs = [];
      
      for (let i = 0; i < jobs.length; i += batchSize) {
        const batch = jobs.slice(i, i + batchSize);
        
        const prompt = `You are a job matching expert. Score how well each job matches the candidate's profile.

Candidate Profile:
- Skills: ${resumeData.skills?.join(', ')}
- Experience: ${resumeData.experience}
- Preferred Job Titles: ${resumeData.jobTitles?.join(', ')}
- Education: ${resumeData.education?.join(', ')}
- Preferred Locations: ${preferences.locations?.join(', ') || 'Any'}
- Experience Level: ${resumeData.experienceLevel}

Jobs to Score:
${batch.map((job, idx) => `
Job ${idx + 1}:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Remote: ${job.remote}
Skills Required: ${job.skills?.join(', ')}
Experience Level: ${job.experienceLevel}
Description: ${job.description?.substring(0, 300)}...
`).join('\n---\n')}

Provide scores (0-100) in JSON format:
{
  "scores": [
    { "jobIndex": 0, "score": 85, "reason": "Brief explanation" },
    ...
  ]
}`;

        const response = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are a job matching AI. Score jobs objectively.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        });
        
        const result = JSON.parse(response.choices[0].message.content);
        
        result.scores.forEach((scoreData) => {
          const job = batch[scoreData.jobIndex];
          if (job) {
            scoredJobs.push({
              ...job.toObject(),
              matchScore: scoreData.score,
              matchReason: scoreData.reason
            });
          }
        });
      }
      
      return scoredJobs;
    } catch (error) {
      logger.error('Score calculation error:', error);
      // Fallback to simple scoring if AI fails
      return jobs.map(job => ({
        ...job.toObject(),
        matchScore: this.simpleMatchScore(job, resumeData, preferences)
      }));
    }
  }
  
  /**
   * Simple fallback scoring algorithm
   */
  simpleMatchScore(job, resumeData, preferences) {
    let score = 50; // Base score
    
    // Skills match
    if (job.skills && resumeData.skills) {
      const matchingSkills = job.skills.filter(skill => 
        resumeData.skills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
      score += Math.min(matchingSkills.length * 5, 30);
    }
    
    // Job title match
    if (resumeData.jobTitles && resumeData.jobTitles.some(title =>
      job.title.toLowerCase().includes(title.toLowerCase())
    )) {
      score += 15;
    }
    
    // Location match
    if (preferences.locations && preferences.locations.some(loc =>
      job.location?.toLowerCase().includes(loc.toLowerCase())
    )) {
      score += 10;
    }
    
    // Remote preference
    if (preferences.remotePreference === job.remote) {
      score += 5;
    }
    
    return Math.min(score, 100);
  }
  
  /**
   * Scrape jobs from various sources
   */
  async scrapeJobs(resumeData, preferences, limit = 20) {
    try {
      const jobs = [];
      
      // Build search query
      const keywords = [
        ...(resumeData.jobTitles || []),
        ...(preferences.jobTitles || [])
      ].join(' OR ');
      
      const location = preferences.locations?.[0] || 'Remote';
      
      // Example: Scrape from job boards (simplified)
      // In production, you'd use official APIs or more sophisticated scraping
      
      // Adzuna API (if configured)
      if (process.env.ADZUNA_API_ID && process.env.ADZUNA_API_KEY) {
        try {
          const adzunaJobs = await this.scrapeAdzuna(keywords, location, limit);
          jobs.push(...adzunaJobs);
        } catch (err) {
          logger.error('Adzuna scraping error:', err);
        }
      }
      
      // Save scraped jobs to database
      const savedJobs = [];
      for (const jobData of jobs) {
        try {
          const existingJob = await Job.findOne({ url: jobData.url });
          if (!existingJob) {
            const job = await Job.create(jobData);
            savedJobs.push(job);
          } else {
            savedJobs.push(existingJob);
          }
        } catch (err) {
          logger.error('Error saving scraped job:', err);
        }
      }
      
      return savedJobs;
    } catch (error) {
      logger.error('Job scraping error:', error);
      return [];
    }
  }
  
  /**
   * Scrape jobs from Adzuna API
   */
  async scrapeAdzuna(keywords, location, limit) {
    try {
      const response = await axios.get('https://api.adzuna.com/v1/api/jobs/us/search/1', {
        params: {
          app_id: process.env.ADZUNA_API_ID,
          app_key: process.env.ADZUNA_API_KEY,
          what: keywords,
          where: location,
          results_per_page: limit
        }
      });
      
      return response.data.results.map(job => ({
        title: job.title,
        company: job.company.display_name,
        description: job.description,
        location: job.location.display_name,
        salary: {
          min: job.salary_min,
          max: job.salary_max
        },
        url: job.redirect_url,
        source: 'ai-scraped',
        sourceDetails: {
          platform: 'Adzuna',
          scrapedAt: new Date(),
          apiId: job.id
        },
        postedDate: new Date(job.created),
        isActive: true
      }));
    } catch (error) {
      logger.error('Adzuna API error:', error);
      return [];
    }
  }
  
  /**
   * Update user's matched jobs
   */
  async updateUserMatchedJobs(userId, jobs) {
    try {
      const jobIds = jobs.map(j => j._id);
      
      // Update each job with match data
      for (const job of jobs) {
        await Job.findByIdAndUpdate(job._id, {
          $addToSet: {
            matchedUsers: {
              user: userId,
              score: job.matchScore,
              matchedAt: new Date(),
              notified: false
            }
          }
        });
      }
      
      logger.info(`Updated ${jobs.length} matched jobs for user ${userId}`);
    } catch (error) {
      logger.error('Error updating matched jobs:', error);
    }
  }
  
  /**
   * Generate personalized job recommendations email content
   */
  async generateRecommendationEmail(user, jobs) {
    try {
      const prompt = `Generate a personalized job recommendation email for ${user.firstName}.

User's Top Matching Jobs:
${jobs.slice(0, 5).map((job, idx) => `
${idx + 1}. ${job.title} at ${job.company}
   Location: ${job.location} (${job.remote})
   Match Score: ${job.matchScore}%
   URL: ${job.url}
`).join('\n')}

Create a friendly, professional email (max 200 words) that:
1. Greets the user by first name
2. Highlights 3-5 top matches
3. Encourages them to apply
4. Keeps a positive, motivating tone`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a career advisor writing personalized job emails.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Email generation error:', error);
      return null;
    }
  }
}

module.exports = new AIService();
