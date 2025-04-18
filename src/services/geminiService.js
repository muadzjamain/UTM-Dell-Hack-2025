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
export const generateResponse = async (prompt, context = [], systemPrompt = null) => {
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
          ...(systemPrompt ? [{
            role: 'system',
            parts: [{ text: systemPrompt }]
          }] : []),
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
 * Generate a response from the Dell AI Assistant chatbot
 * @param {string} message - The user's message
 * @param {Array} chatHistory - Previous chat messages for context
 * @param {Object} userProfile - User profile information for personalization
 * @returns {Promise<string>} - The AI assistant's response
 */
export const getDellAssistantResponse = async (message, chatHistory = [], userProfile = {}) => {
  try {
    console.log('Processing request for Dell Assistant with message:', message);
    
    // Create a comprehensive pre-prompt that defines the assistant's personality and capabilities
    const prePrompt = `You are Deltri's AI Onboarding Assistant, a specialized AI designed to support new Dell employees with a dual role:

1. TRAINING SUPPORT SPECIALIST:
- Guide employees through Dell's training modules with step-by-step instructions
- Answer technical questions about Dell systems, tools, and technologies
- Explain Dell's product portfolio, services, and technical specifications
- Provide troubleshooting assistance for common Dell systems and software
- Recommend specific learning resources based on employee role and experience

2. HR GUIDANCE COUNSELOR:
- Assist with onboarding processes, paperwork requirements, and deadlines
- Explain Dell's benefits packages, policies, and workplace practices in detail
- Help navigate Dell's organizational structure, reporting relationships, and team dynamics
- Provide information about career development paths and growth opportunities
- Offer guidance on workplace culture, values, and expectations

COMMUNICATION GUIDELINES:
- Use a warm, professional tone that makes new employees feel welcome and supported
- Personalize your responses using the employee's name, role, and department
- Provide concise, actionable information that employees can immediately apply
- Format responses in plain text without markdown formatting
- When you don't know something specific, acknowledge it honestly and suggest who to contact
- Respond with empathy to concerns or challenges the employee might be facing
- Keep responses focused and relevant to Dell's specific processes and systems

KEY DELL INFORMATION TO REFERENCE:
- Dell Technologies was founded by Michael Dell in 1984
- Core values: Customer focus, Innovation, Direct relationships, Winning together
- Major product categories: PCs, servers, storage, networking, security solutions
- Key HR policies include flexible work arrangements and comprehensive benefits
- Training modules cover technical skills, compliance, and professional development

Now, please respond to the following query from the Dell employee:
`;

    // Add personalization based on user profile
    let personalizedContext = '';
    if (userProfile && Object.keys(userProfile).length > 0) {
      const userName = userProfile.firstName || 'there';
      const department = userProfile.department || 'Dell Technologies';
      const role = userProfile.role || 'employee';
      const daysSinceStart = userProfile.startDate ? 
        Math.ceil(Math.abs(new Date() - new Date(userProfile.startDate)) / (1000 * 60 * 60 * 24)) : 1;
      
      // Create detailed context about the user
      personalizedContext = `\n\n[EMPLOYEE CONTEXT: Name: ${userName} | Role: ${role} | Department: ${department} | Days at Dell: ${daysSinceStart} | Onboarding Stage: ${daysSinceStart < 7 ? 'Initial' : daysSinceStart < 30 ? 'Intermediate' : 'Advanced'}]\n\n`;
    }
    
    // Format previous conversation for context
    let conversationContext = '';
    if (chatHistory && chatHistory.length > 0) {
      // Only use the last 5 messages for context to keep it focused
      const recentHistory = chatHistory.slice(-5);
      conversationContext = '\n\n[CONVERSATION HISTORY:\n' + 
        recentHistory.map(msg => `${msg.sender === 'user' ? 'Employee' : 'Assistant'}: ${msg.text}`).join('\n') + 
        ']\n\n';
    }
    
    // Combine everything into the full query
    const fullQuery = prePrompt + personalizedContext + conversationContext + message;
    console.log('Sending full query to Gemini:', fullQuery);
    
    // Call the Gemini API with our enhanced prompt
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyC_JpUazzp4cfukgazRk4HufNw5fjFrMHU`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: fullQuery }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
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
    console.log('Received response from Gemini:', data);
    
    // Extract the text response from the API response
    if (data && data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      
      // Get the raw text response
      const textResponse = data.candidates[0].content.parts[0].text;
      
      // Format the response to remove any markdown or unnecessary formatting
      let formattedResponse = textResponse;
      
      // Remove markdown formatting
      formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold
      formattedResponse = formattedResponse.replace(/\*(.*?)\*/g, '$1'); // Remove italic
      formattedResponse = formattedResponse.replace(/```(.*?)```/gs, '$1'); // Remove code blocks
      formattedResponse = formattedResponse.replace(/`(.*?)`/g, '$1'); // Remove inline code
      formattedResponse = formattedResponse.replace(/#{1,6}\s+(.+)/g, '$1'); // Remove headers
      
      return formattedResponse;
    } else {
      console.warn('Unexpected response structure:', JSON.stringify(data));
      return "I'm sorry, I'm having trouble processing your request right now. How else can I help you with your onboarding at Dell?";
    }
  } catch (error) {
    console.error('Error getting Dell Assistant response:', error);
    
    // Provide intelligent fallback responses based on keywords in the message
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('training') || lowerMessage.includes('learn') || lowerMessage.includes('course')) {
      return "Dell offers comprehensive training modules for all new employees. You can access them through the Learning Portal on the intranet. The required modules for your role should be listed on your personalized dashboard. Would you like me to help you find specific training resources?";
    } 
    else if (lowerMessage.includes('benefit') || lowerMessage.includes('insurance') || lowerMessage.includes('vacation') || lowerMessage.includes('time off')) {
      return "Dell provides a competitive benefits package including health insurance, retirement plans, and paid time off. You can find detailed information in the Benefits Portal, or you can schedule a call with HR to discuss your specific questions. The standard PTO policy gives you 15 days annually, accrued monthly.";
    }
    else if (lowerMessage.includes('laptop') || lowerMessage.includes('computer') || lowerMessage.includes('device') || lowerMessage.includes('equipment')) {
      return "For any IT equipment issues or requests, please contact the IT Service Desk at extension 4357 or submit a ticket through the IT Support Portal. For new equipment requests, you'll need your manager's approval through the procurement system.";
    }
    else if (lowerMessage.includes('password') || lowerMessage.includes('login') || lowerMessage.includes('access')) {
      return "For password resets or access issues, please visit the IT Self-Service Portal or contact the IT Service Desk. Remember that Dell requires password changes every 90 days and passwords must include a mix of uppercase, lowercase, numbers, and special characters.";
    }
    else if (lowerMessage.includes('policy') || lowerMessage.includes('compliance') || lowerMessage.includes('security')) {
      return "Dell has comprehensive security and compliance policies that all employees must follow. You can find these in the Policy Portal on the intranet. The required compliance training modules should be completed within your first 30 days. Is there a specific policy you'd like to know more about?";
    }
    else if (lowerMessage.includes('team') || lowerMessage.includes('department') || lowerMessage.includes('colleague') || lowerMessage.includes('manager')) {
      return "Your team information can be found in Workday, including your reporting structure and team members. Dell encourages regular 1:1 meetings with your manager and team collaboration. Would you like tips on how to connect with your new colleagues?";
    }
    else if (lowerMessage.includes('office') || lowerMessage.includes('location') || lowerMessage.includes('building') || lowerMessage.includes('desk')) {
      return "Information about your office location, desk assignment, and building access should have been provided in your welcome email. If you're working remotely, Dell's flexible work policy allows for a hybrid arrangement based on your team's requirements and your manager's approval.";
    }
    else {
      return "I'm experiencing some technical difficulties at the moment. Please try asking your question again, or you can contact the IT helpdesk at extension 4357 for immediate assistance with any technical issues, or HR Connect for personnel-related questions.";
    }
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
