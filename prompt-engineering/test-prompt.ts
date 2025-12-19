import { Command } from 'commander'
import { generateComment } from '../convex/prompting'
import { agents } from './agents'
import { posts } from './posts'

const program = new Command()

program
  .name('test-prompt')
  .description('Test AI comment generation with different agents and posts')
  .requiredOption('-a, --agent <index>', 'Agent index', parseInt)
  .requiredOption('-p, --post <index>', 'Post index', parseInt)
  .addHelpText(
    'after',
    `
Available agents:
${agents.map((agent, i) => `  ${i}: ${agent.name}`).join('\n')}

Available posts:
${posts.map((post, i) => `  ${i}: ${post.title}`).join('\n')}`,
  )
  .parse()

const opts = program.opts<{ agent: number; post: number }>()

if (opts.agent < 0 || opts.agent >= agents.length) {
  console.error(
    `Invalid agent index: ${opts.agent}. Must be 0-${agents.length - 1}`,
  )
  process.exit(1)
}

if (opts.post < 0 || opts.post >= posts.length) {
  console.error(
    `Invalid post index: ${opts.post}. Must be 0-${posts.length - 1}`,
  )
  process.exit(1)
}

const agent = agents[opts.agent]
const post = posts[opts.post]

console.log(`Agent: ${agent.name}`)
console.log(`Post: ${post.title}`)
console.log('---')

generateComment(agent, post)
  .then((comment) => console.log(comment))
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })
