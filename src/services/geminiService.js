/**
 * Gemini API Service for Deltri AI-Powered Onboarding Assistant
 * This service handles all interactions with the Google Gemini API
 */

// Note: You'll need to add your Gemini API key to your .env file
// REACT_APP_GEMINI_API_KEY=your_api_key_here

/**
 * Generate a response from Gemini API
 * @param {string} prompt - The user's prompt or question
 * @param {Array} context - Optional context from previous conversations
 * @returns {Promise<Object>} - The AI response
 */
export const generateResponse = async (prompt, context = []) => {
  try {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key is missing. Please add it to your .env file.');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          },
          ...context
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate response');
    }

    return data.candidates[0].content;
  } catch (error) {
    console.error('Error generating response from Gemini:', error);
    throw error;
  }
};

/**
 * Summarize a document using Gemini API
 * @param {string} text - The document text to summarize
 * @returns {Promise<string>} - The summarized text
 */
export const summarizeDocument = async (text) => {
  try {
    const prompt = `Please summarize the following document concisely, highlighting the key points and main takeaways:\n\n${text}`;
    const response = await generateResponse(prompt);
    return response.parts[0].text;
  } catch (error) {
    console.error('Error summarizing document:', error);
    throw error;
  }
};

/**
 * Generate a quiz based on document content
 * @param {string} text - The document text to generate a quiz from
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Promise<Array>} - Array of quiz questions with answers
 */
export const generateQuiz = async (text, numQuestions = 5) => {
  try {
    const prompt = `Based on the following content, generate a quiz with ${numQuestions} multiple-choice questions. 
    For each question, provide 4 options and indicate the correct answer. 
    Format the response as a JSON array with objects containing: question, options (array), and correctAnswer (index of correct option).\n\n${text}`;
    
    const response = await generateResponse(prompt);
    const quizText = response.parts[0].text;
    
    // Extract the JSON part from the response
    const jsonMatch = quizText.match(/```json\n([\s\S]*?)\n```/) || 
                      quizText.match(/\[([\s\S]*?)\]/) ||
                      quizText;
    
    const jsonString = jsonMatch[1] || quizText;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating quiz:', error);
    // Return a fallback quiz if parsing fails
    return [
      {
        question: "What is the main topic of this document?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0
      }
    ];
  }
};

/**
 * Generate personalized learning goals based on employee role and preferences
 * @param {Object} employee - Employee data including role and preferences
 * @returns {Promise<Array>} - Array of suggested learning goals
 */
export const generateLearningGoals = async (employee) => {
  try {
    const prompt = `Generate 5 personalized learning goals for a ${employee.role} with the following preferences: 
    ${JSON.stringify(employee.preferences)}. 
    Format the response as a JSON array of goal objects with: title, description, and estimatedTimeToComplete (in hours).`;
    
    const response = await generateResponse(prompt);
    const goalsText = response.parts[0].text;
    
    // Extract the JSON part from the response
    const jsonMatch = goalsText.match(/```json\n([\s\S]*?)\n```/) || 
                      goalsText.match(/\[([\s\S]*?)\]/) ||
                      goalsText;
    
    const jsonString = jsonMatch[1] || goalsText;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating learning goals:', error);
    // Return fallback goals
    return [
      {
        title: "Complete Orientation",
        description: "Finish all orientation materials and introductory courses",
        estimatedTimeToComplete: 4
      }
    ];
  }
};

/**
 * Generate performance feedback based on employee progress
 * @param {Object} progress - Employee progress data
 * @returns {Promise<Object>} - Feedback object with strengths, areas for improvement, and recommendations
 */
export const generatePerformanceFeedback = async (progress) => {
  try {
    const prompt = `Based on the following employee progress data, generate constructive feedback including strengths, 
    areas for improvement, and specific recommendations for future development: ${JSON.stringify(progress)}. 
    Format the response as a JSON object with: strengths (array), areasForImprovement (array), and recommendations (array).`;
    
    const response = await generateResponse(prompt);
    const feedbackText = response.parts[0].text;
    
    // Extract the JSON part from the response
    const jsonMatch = feedbackText.match(/```json\n([\s\S]*?)\n```/) || 
                      feedbackText.match(/\{([\s\S]*?)\}/) ||
                      feedbackText;
    
    const jsonString = jsonMatch[1] || feedbackText;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating performance feedback:', error);
    // Return fallback feedback
    return {
      strengths: ["Completed initial training modules on time"],
      areasForImprovement: ["Consider spending more time on technical modules"],
      recommendations: ["Schedule weekly check-ins with your manager"]
    };
  }
};
