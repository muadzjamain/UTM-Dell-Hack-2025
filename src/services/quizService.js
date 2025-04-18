/**
 * Service for handling Dell Compliance Quiz functionality
 */

// Hardcoded API key to ensure it's available
const API_KEY = 'AIzaSyC_JpUazzp4cfukgazRk4HufNw5fjFrMHU';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Generate a compliance quiz with AI
 * @param {number} count - Number of questions to generate
 * @returns {Promise<Array>} - Array of quiz questions with options and answers
 */
export const generateComplianceQuiz = async (count = 10) => {
  try {
    console.log('Generating compliance quiz with', count, 'questions');
    
    // Create a prompt that instructs the AI to generate quiz questions
    const prompt = `Generate a quiz with ${count} multiple-choice questions about Dell's corporate compliance, ethics, values, and workplace policies. 

Each question should have 4 options (A, B, C, D) with only one correct answer.

The quiz should cover topics such as:
- Data privacy and security
- Ethical business practices
- Anti-corruption and bribery
- Workplace harassment and discrimination
- Intellectual property protection
- Conflicts of interest
- Environmental compliance
- Social media usage
- Confidential information handling
- Reporting violations and non-retaliation

Format the response as a JSON array of objects, where each object has the following structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0 // Index of the correct answer (0-3)
}

Make sure the questions are challenging but fair, and cover a wide range of compliance topics relevant to Dell employees.`;

    // Call the Gemini API
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          topP: 0.95,
          topK: 40
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received quiz response from Gemini');
    
    // Extract the text response
    if (data && data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      
      const textResponse = data.candidates[0].content.parts[0].text;
      
      // Find the JSON part in the response
      const jsonMatch = textResponse.match(/\\[\\s\\S]*?\\]/);
      if (jsonMatch) {
        try {
          // Parse the JSON
          const quizQuestions = JSON.parse(jsonMatch[0]);
          return quizQuestions;
        } catch (parseError) {
          console.error('Error parsing quiz JSON:', parseError);
          return getFallbackQuiz(count);
        }
      } else {
        console.warn('Could not find JSON in response');
        return getFallbackQuiz(count);
      }
    } else {
      console.warn('Unexpected response structure:', JSON.stringify(data));
      return getFallbackQuiz(count);
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    return getFallbackQuiz(count);
  }
};

/**
 * Get a fallback quiz in case the API fails
 * @param {number} count - Number of questions to include
 * @returns {Array} - Array of quiz questions
 */
const getFallbackQuiz = (count) => {
  const allQuestions = [
    {
      question: "What should you do if you suspect a violation of Dell's Code of Conduct?",
      options: [
        "Keep it to yourself to avoid causing trouble",
        "Report it through appropriate channels like Ethics Helpline",
        "Confront the person directly",
        "Post about it on social media"
      ],
      correctAnswer: 1
    },
    {
      question: "Which of the following is NOT one of Dell's core values?",
      options: [
        "Customer",
        "Innovation",
        "Competition",
        "Integrity"
      ],
      correctAnswer: 2
    },
    {
      question: "What is Dell's policy on accepting gifts from vendors or partners?",
      options: [
        "All gifts are prohibited regardless of value",
        "Gifts under $100 are always acceptable",
        "Modest gifts that don't influence business decisions may be acceptable",
        "Employees can accept any gift as long as they report it"
      ],
      correctAnswer: 2
    },
    {
      question: "How should you handle Dell's confidential information?",
      options: [
        "Share it only with other Dell employees",
        "Protect it according to classification and only share on a need-to-know basis",
        "It's fine to discuss in public as long as you don't share documents",
        "You can share after signing an NDA with anyone"
      ],
      correctAnswer: 1
    },
    {
      question: "What constitutes a conflict of interest at Dell?",
      options: [
        "Having any relationships with people at other companies",
        "Working overtime on Dell projects",
        "Situations where personal interests could interfere with Dell's interests",
        "Participating in company social events"
      ],
      correctAnswer: 2
    },
    {
      question: "What is Dell's approach to environmental responsibility?",
      options: [
        "It's optional for employees to follow environmental policies",
        "Environmental concerns are secondary to business growth",
        "Commitment to sustainability and reducing environmental impact",
        "Only manufacturing facilities need to follow environmental guidelines"
      ],
      correctAnswer: 2
    },
    {
      question: "How should Dell employees handle social media?",
      options: [
        "Never mention Dell on personal social media",
        "Use good judgment, disclose employment, and don't share confidential information",
        "Only post positive things about Dell products",
        "All social media posts must be approved by management"
      ],
      correctAnswer: 1
    },
    {
      question: "What is Dell's policy on workplace harassment?",
      options: [
        "Zero tolerance - all forms of harassment are prohibited",
        "Only physical harassment is prohibited",
        "Occasional teasing is acceptable",
        "Harassment policies only apply during work hours"
      ],
      correctAnswer: 0
    },
    {
      question: "How should Dell employees handle competitive information?",
      options: [
        "Use any means necessary to obtain competitor information",
        "Only use publicly available information or information obtained ethically",
        "It's acceptable to mislead others to get competitive information",
        "Competitive information isn't useful and should be ignored"
      ],
      correctAnswer: 1
    },
    {
      question: "What is Dell's policy on anti-corruption and bribery?",
      options: [
        "Small facilitation payments are acceptable",
        "Bribes are acceptable in countries where they are common practice",
        "Zero tolerance for bribery and corruption in any form",
        "Bribery is only prohibited when dealing with government officials"
      ],
      correctAnswer: 2
    },
    {
      question: "What should Dell employees do if they receive an unsolicited email containing sensitive customer data?",
      options: [
        "Forward it to their personal email for safekeeping",
        "Delete it immediately without reporting",
        "Report it to security and follow data incident protocols",
        "Share it with the team to determine how to handle it"
      ],
      correctAnswer: 2
    },
    {
      question: "What is Dell's approach to diversity and inclusion?",
      options: [
        "Hiring should always prioritize technical skills over diversity",
        "Diversity is encouraged but not a business priority",
        "Commitment to a diverse workforce and inclusive culture",
        "Diversity initiatives only apply to certain departments"
      ],
      correctAnswer: 2
    },
    {
      question: "How should Dell employees handle intellectual property?",
      options: [
        "All inventions belong to the employee who created them",
        "Respect Dell's IP and third-party IP rights according to policy",
        "IP protection only matters for products, not internal processes",
        "Employees can use Dell IP for personal projects"
      ],
      correctAnswer: 1
    },
    {
      question: "What is Dell's policy on political contributions?",
      options: [
        "Employees can use company resources for personal political activities",
        "Dell encourages employees to make political contributions in the company's name",
        "Political activities should be kept separate from work and use personal resources",
        "Political discussions are prohibited in the workplace"
      ],
      correctAnswer: 2
    },
    {
      question: "How does Dell protect customer privacy?",
      options: [
        "By collecting minimal data and following privacy laws and policies",
        "By sharing data only with trusted partners",
        "By allowing customers to opt-out of all data collection",
        "By keeping all data indefinitely for quality assurance"
      ],
      correctAnswer: 0
    },
    {
      question: "What is Dell's policy on insider trading?",
      options: [
        "Employees can trade Dell stock anytime except during blackout periods",
        "Only executives are restricted from trading based on inside information",
        "Trading based on material non-public information is prohibited",
        "Employees can share inside information with family members"
      ],
      correctAnswer: 2
    },
    {
      question: "How should Dell employees respond to media inquiries?",
      options: [
        "Provide honest answers based on their knowledge",
        "Refer inquiries to Corporate Communications or Media Relations",
        "Decline to comment on all inquiries",
        "Share their personal opinions but clarify they don't speak for Dell"
      ],
      correctAnswer: 1
    },
    {
      question: "What is Dell's approach to financial integrity?",
      options: [
        "Only the finance department needs to ensure accurate records",
        "Minor expenses don't need to be documented accurately",
        "All employees must ensure accurate business and financial records",
        "Financial accuracy is only important for public reporting"
      ],
      correctAnswer: 2
    },
    {
      question: "How should Dell employees handle third-party software?",
      options: [
        "Install only properly licensed software according to IT policies",
        "Any software is acceptable if it helps productivity",
        "Free software doesn't require approval",
        "Employees can use their judgment about which software to install"
      ],
      correctAnswer: 0
    },
    {
      question: "What is Dell's policy on retaliation against employees who report concerns?",
      options: [
        "Retaliation is prohibited against anyone who reports in good faith",
        "Retaliation is acceptable if the report turns out to be incorrect",
        "Only direct retaliation by managers is prohibited",
        "Protection from retaliation only applies to certain types of reports"
      ],
      correctAnswer: 0
    }
  ];
  
  // Return a random subset of questions
  return shuffleArray(allQuestions).slice(0, Math.min(count, allQuestions.length));
};

/**
 * Shuffle an array randomly
 * @param {Array} array - The array to shuffle
 * @returns {Array} - The shuffled array
 */
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Save quiz score to local storage
 * @param {number} score - Score as a percentage
 */
export const saveQuizScore = (score) => {
  try {
    // Get existing scores
    const scoresJson = localStorage.getItem('dellComplianceQuizScores');
    let scores = scoresJson ? JSON.parse(scoresJson) : [];
    
    // Add new score with timestamp
    scores.push({
      score,
      timestamp: new Date().toISOString()
    });
    
    // Keep only the last 10 scores
    if (scores.length > 10) {
      scores = scores.slice(-10);
    }
    
    // Save back to localStorage
    localStorage.setItem('dellComplianceQuizScores', JSON.stringify(scores));
    
    // Also save the latest score separately for easy access
    localStorage.setItem('dellLatestQuizScore', score.toString());
    
    console.log('Saved quiz score:', score);
  } catch (error) {
    console.error('Error saving quiz score:', error);
  }
};

/**
 * Get the latest quiz score
 * @returns {number} - Latest quiz score as a percentage
 */
export const getLatestQuizScore = () => {
  try {
    const score = localStorage.getItem('dellLatestQuizScore');
    return score ? parseInt(score, 10) : null;
  } catch (error) {
    console.error('Error getting latest quiz score:', error);
    return null;
  }
};

/**
 * Get all saved quiz scores
 * @returns {Array} - Array of score objects with score and timestamp
 */
export const getAllQuizScores = () => {
  try {
    const scoresJson = localStorage.getItem('dellComplianceQuizScores');
    return scoresJson ? JSON.parse(scoresJson) : [];
  } catch (error) {
    console.error('Error getting quiz scores:', error);
    return [];
  }
};
