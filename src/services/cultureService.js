/**
 * Service for handling Dell Culture & Compliance AI conversations
 */

// Hardcoded API key to ensure it's available
const API_KEY = 'AIzaSyC_JpUazzp4cfukgazRk4HufNw5fjFrMHU';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Get a response from Gemini AI for Culture & Compliance queries
 * @param {string} query - The user's question
 * @returns {Promise<string>} - The AI response
 */
export const getCultureResponse = async (query) => {
  try {
    console.log('Processing Culture & Compliance query:', query);
    
    // Create a comprehensive pre-prompt that instructs the AI to be a Dell Culture & Compliance assistant
    const prePrompt = `You are Dell's Culture & Compliance Assistant, specialized in helping new employees understand Dell's corporate culture, values, ethics, and compliance requirements.

INSTRUCTIONS:
1. Act as a knowledgeable mentor who guides new Dell employees through the company's cultural norms and compliance expectations
2. Provide clear, actionable advice that helps employees align with Dell's values and ethics
3. Format your responses in plain text (no markdown)
4. Keep your tone warm, supportive, and professional
5. When answering, structure your response in this format:
   - Direct answer to the question
   - Connection to Dell's core values or compliance principles
   - Practical example or application in the workplace
6. If you're unsure about specific Dell details, acknowledge that and provide general best practices

DELL CULTURE & COMPLIANCE INFORMATION:
- Dell's Core Values: Customer, Innovation, Results, Integrity, Relationships
- Dell's Code of Conduct emphasizes ethical decision-making, respect in the workplace, and business integrity
- Dell's Diversity & Inclusion initiatives focus on creating an inclusive workplace for all employees
- Dell's Environmental, Social, and Governance (ESG) commitments include sustainability goals and social impact
- Dell's compliance requirements include data privacy, information security, anti-corruption, and trade compliance
- Dell's "Speak Up" policy encourages employees to report concerns without fear of retaliation
- Dell's "Winning Together" principle emphasizes collaboration and teamwork across the organization
- Dell's "Direct Model" philosophy applies to both customer relationships and internal communication

Now, please answer the following question as Dell's Culture & Compliance Assistant:
`;

    // Combine the pre-prompt with the user's query
    const fullQuery = prePrompt + query;
    
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
            parts: [{ text: fullQuery }]
          }
        ],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more factual responses
          maxOutputTokens: 800,
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
    console.log('Received Culture & Compliance response from Gemini:', data);
    
    // Extract and format the response
    if (data && data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      
      // Get the raw text response
      const textResponse = data.candidates[0].content.parts[0].text;
      
      // Format the response to remove any markdown
      let formattedResponse = textResponse;
      formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold
      formattedResponse = formattedResponse.replace(/\*(.*?)\*/g, '$1'); // Remove italic
      formattedResponse = formattedResponse.replace(/```(.*?)```/gs, '$1'); // Remove code blocks
      formattedResponse = formattedResponse.replace(/`(.*?)`/g, '$1'); // Remove inline code
      
      return formattedResponse;
    } else {
      console.warn('Unexpected response structure:', JSON.stringify(data));
      return "I'm sorry, I couldn't provide information about Dell's culture and compliance at the moment. Please try again or reach out to your HR representative for assistance.";
    }
  } catch (error) {
    console.error('Error getting Culture & Compliance response:', error);
    
    // Provide fallback responses based on keywords in the query
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('value') || lowerQuery.includes('culture')) {
      return "Dell's core values are Customer, Innovation, Results, Integrity, and Relationships. These values guide how we work together and serve our customers. For example, our customer-centric approach means we listen to customer needs and develop solutions that address their challenges directly.";
    } 
    else if (lowerQuery.includes('ethics') || lowerQuery.includes('ethical')) {
      return "Ethics at Dell means doing the right thing even when no one is watching. Our Code of Conduct provides guidance on ethical decision-making in various situations. If you ever face an ethical dilemma, ask yourself: Is it legal? Does it comply with our policies? Would I be comfortable if it were made public? If you answer 'no' to any of these, seek guidance from your manager or Ethics & Compliance team.";
    }
    else if (lowerQuery.includes('diversity') || lowerQuery.includes('inclusion')) {
      return "Dell is committed to building a diverse and inclusive workplace where everyone feels valued and can contribute their best work. We believe diverse perspectives drive innovation and better business results. Our Employee Resource Groups (ERGs) provide community and support for various identity groups, and we encourage all employees to participate in inclusion initiatives.";
    }
    else if (lowerQuery.includes('report') || lowerQuery.includes('concern') || lowerQuery.includes('violation')) {
      return "Dell has a 'Speak Up' policy that encourages all employees to report concerns without fear of retaliation. You can report concerns to your manager, HR representative, Ethics & Compliance team, or through the Ethics Helpline which allows anonymous reporting. We take all reports seriously and investigate them thoroughly.";
    }
    else if (lowerQuery.includes('compliance') || lowerQuery.includes('regulation')) {
      return "Compliance at Dell means following both the letter and spirit of laws and regulations that apply to our business. Key compliance areas include data privacy, information security, anti-corruption, and trade compliance. All employees are required to complete compliance training relevant to their roles, and resources are available to help you understand your compliance obligations.";
    }
    else {
      return "As a Dell employee, you're part of a culture that values innovation, integrity, and customer focus. Our workplace emphasizes collaboration, respect, and ethical conduct in all interactions. I recommend reviewing the Dell Code of Conduct and speaking with your manager or HR representative to learn more about specific cultural norms and compliance expectations in your role.";
    }
  }
};

/**
 * Get common Culture & Compliance questions for Dell
 * @returns {Array} - List of common Culture & Compliance questions
 */
export const getCommonCultureQuestions = () => {
  return [
    "What are Dell's core values?",
    "How does Dell promote diversity and inclusion?",
    "What should I do if I witness unethical behavior?",
    "What is Dell's environmental commitment?",
    "How does Dell support work-life balance?",
    "What is Dell's Code of Conduct?",
    "How does Dell handle customer data privacy?",
    "What are Dell's expectations for professional behavior?",
    "How can I report an ethics concern?",
    "What training is required for compliance?"
  ];
};
