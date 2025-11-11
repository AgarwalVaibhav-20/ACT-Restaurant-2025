import serverless from 'serverless-http'
import createApp from '../backend/dq-backend-ecommerce/app.js'

// Build the Express app once per runtime
const app = createApp()

// Disable default body parsing to let Express handle it
export const config = { api: { bodyParser: false } }

const handler = serverless(app)

export default async function(req, res) {
  // Strip the /api prefix so Express routes like '/signin' match
  if (req.url && req.url.startsWith('/api')) {
    req.url = req.url.slice(4) || '/'
  }
  return handler(req, res)
}