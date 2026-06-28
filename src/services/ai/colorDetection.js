import { callOpenRouter } from './openrouter';

const COLOR_DETECTION_SYSTEM_PROMPT = `You are an expert fashion AI specialized in traditional Indian wear and sarees.
Your task is to analyze one or more uploaded images of a saree and determine the exact primary color of the saree fabric.
Ignore the model, skin tone, background, props, or lighting. Focus strictly on the saree fabric.
If multiple images are provided, analyze all of them to find the most consistent primary color, ignoring lighting differences.

You MUST map the detected primary color to one of these fashion-friendly names commonly used in saree retail:
- Rani Pink, Onion Pink, Wine, Maroon, Crimson Red, Vermilion Red, Coral, Peach
- Bottle Green, Emerald Green, Parrot Green, Olive Green, Teal
- Peacock Blue, Royal Blue, Navy Blue, Sky Blue, Turquoise
- Lavender, Mauve, Purple, Violet
- Mustard Yellow, Golden Yellow
- Beige, Cream, Ivory, Off White, White
- Black, Grey, Silver Grey
- Coffee Brown, Chocolate Brown, Copper, Rust Orange
If the color is not exactly one of these, pick the closest matching one from the list.

You must also determine the closest matching HEX code for the detected primary color.

If the saree contains a distinct secondary color (e.g., a prominent border color like Gold or contrast pallu), detect that as well.

You MUST respond strictly with valid JSON only. Do not include any markdown formatting, code blocks (like \`\`\`json), or conversational text.
Your JSON must follow this exact schema:
{
  "primaryColor": "Color Name from the allowed list",
  "hex": "#RRGGBB",
  "secondaryColor": "Secondary Color Name (if any, otherwise null)",
  "confidence": <number between 0 and 100 representing your confidence in the primary color detection>
}`;

export const detectVariantColor = async (imageUrls) => {
  if (!imageUrls || imageUrls.length === 0) {
    throw new Error('No images provided for color detection.');
  }

  const userText = 'Please detect the dominant saree fabric color from these images.';

  try {
    const result = await callOpenRouter(COLOR_DETECTION_SYSTEM_PROMPT, userText, 'google/gemini-2.5-flash', imageUrls);
    
    // Validate the response
    if (!result.primaryColor || !result.hex || result.confidence === undefined) {
      throw new Error('Invalid response format from AI');
    }

    return result;
  } catch (error) {
    console.error('Error detecting variant color:', error);
    throw error;
  }
};
