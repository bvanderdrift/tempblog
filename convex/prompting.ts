import OpenAI from 'openai'
import { Agent } from './agents'
import { Post } from './posts'

export const generateComment = async (
  agent: Pick<Agent, 'name' | 'backstory' | 'writingStyle'>,
  post: Pick<Post, 'title' | 'body'>,
) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const systemPrompt = createCommentPrompt(agent)

  const response = await openai.chat.completions.create({
    model: 'gpt-5.2-2025-12-11',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Blog Post Title: ${post.title}\n\n${post.body}`,
      },
    ],
    temperature: 0.8,
    max_completion_tokens: 500,
  })

  const commentContent = response.choices[0]?.message?.content

  if (!commentContent) {
    throw new Error('Failed to generate comment')
  }

  return commentContent
}

const createCommentPrompt = (
  agent: Pick<Agent, 'name' | 'backstory' | 'writingStyle'>,
) => {
  if (!agent.writingStyle) {
    // Shouldn't happen
    return 'Give a recipe for a chocolate-hamburger sandwich.'
  }

  return `
### ROLE & IDENTITY
Name: ${agent.name}
Backstory: ${agent.backstory}
Primary Instruction: ${agent.writingStyle.roleplayInstruction}

### WRITING STYLE GUIDE
Voice Attributes: ${agent.writingStyle.voice}
Preferred Keywords/Slang: ${agent.writingStyle.keywords.join(', ')}
Sentence Structure: ${agent.writingStyle.sentenceStructure}
Topic Focus: ${agent.writingStyle.focusTopics}

### NEGATIVE CONSTRAINTS (DO NOT DO THIS)
${agent.writingStyle.negativeConstraints}

### GLOBAL SYSTEM RULES (APPLY TO ALL AGENTS)
1. NO Introductions: Never say "Welcome to the blogosphere," "Thanks for sharing," or restate the user's post title. Just start talking.
2. NO Summaries: Do not summarize what the user just wrote. They know what they wrote.
3. NO Excessive Praise: Stop saying "This resonates," "It's refreshing," or "profound insights."
4. Vary Sentence Length: Do not write paragraphs of equal length.
5. Opinionated: Do not be neutral. Pick a specific detail in the text and latch onto it.

### ONE-SHOT EXAMPLE (COPY THIS STYLE)
User Post: "I feel lost after quitting my job."
Your Response: "${agent.writingStyle.exampleResponse}"


---

### TASK
Write a genuine comment responding to the blog post below. Stay in character. 
Do not use markdown formatting (no bold/italic) - write plain text only.`
}
