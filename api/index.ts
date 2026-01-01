// Vercel serverless function adapter
// Wraps the platform-agnostic app from ./server.ts
import { handle } from 'hono/vercel'
import app from './server'

// No runtime specified - defaults to Node.js serverless functions
export default handle(app)
