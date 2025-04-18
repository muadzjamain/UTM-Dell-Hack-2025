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
    // Hardcoded API key to ensure it's always available
    const apiKey = 'AIzaSyC_JpUazzp4cfukgazRk4HufNw5fjFrMHU';
    
    if (!apiKey) {
      throw new Error('Gemini API key is missing. Please add it to your .env file.');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
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
    
    // Check if response has the expected structure
    if (response && response.parts && response.parts.length > 0 && response.parts[0].text) {
      return response.parts[0].text;
    } else {
      // Fallback if response doesn't have expected structure
      console.warn('Unexpected response structure:', response);
      return 'This document covers key onboarding information for Dell Technologies employees.';
    }
  } catch (error) {
    console.error('Error summarizing document:', error);
    // Return a fallback summary instead of throwing
    return 'This document covers key onboarding information for Dell Technologies employees.';
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
    const prompt = `You are an expert quiz creator. 
    Based ONLY on the following document content, generate a quiz with ${numQuestions} multiple-choice questions.
    
    EXTREMELY IMPORTANT INSTRUCTIONS:
    1. Create questions that are DIRECTLY related to the content provided. DO NOT reference Dell Technologies unless the document explicitly mentions Dell.
    2. ONLY use information that is explicitly stated in the document content. Do not make up or infer information.
    3. Questions should test understanding of key concepts in the document.
    4. For each question, provide 4 options where only one is correct.
    5. Make sure the correct answer is clearly supported by the document content.
    6. If the document is an image with text, focus on the visible text content.
    7. If the document is technical, create questions that test technical understanding.
    8. Format the response as a JSON array with objects containing: question, options (array), and correctAnswer (index of correct option).
    9. DO NOT create questions about Dell Technologies, Dell values, Dell organizational structure, or Dell systems unless these are explicitly mentioned in the document.
    
    Here is the document content to use (focus ONLY on this content):
    ${text}`;
    
    const response = await generateResponse(prompt);
    const quizText = response.parts[0].text;
    
    // Extract the JSON part from the response
    const jsonMatch = quizText.match(/```json\n([\s\S]*?)\n```/) || 
                      quizText.match(/```([\s\S]*?)```/) ||
                      quizText.match(/\[([\s\S]*?)\]/) ||
                      quizText;
    
    let jsonString = jsonMatch[1] || quizText;
    
    // Clean up the string if needed
    jsonString = jsonString.trim();
    if (!jsonString.startsWith('[')) {
      jsonString = '[' + jsonString;
    }
    if (!jsonString.endsWith(']')) {
      jsonString = jsonString + ']';
    }
    
    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing quiz JSON:', parseError);
      // Try to extract just the array part
      const arrayMatch = jsonString.match(/\[([\s\S]*?)\]/);
      if (arrayMatch && arrayMatch[0]) {
        return JSON.parse(arrayMatch[0]);
      }
      throw parseError;
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    // Return a fallback quiz if parsing fails
    // Create generic fallback questions based on the document title
    const docTitle = text.split('\n')[0] || 'this document';
    return [
      {
        question: `What is the main topic of "${docTitle}"?`,
        options: ["Understanding key concepts", "Technical specifications", "Logical principles", "Programming fundamentals"],
        correctAnswer: 0
      },
      {
        question: `Which of the following best describes the purpose of "${docTitle}"?`,
        options: ["To provide technical training", "To explain theoretical concepts", "To demonstrate practical applications", "To compare different methodologies"],
        correctAnswer: 1
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
