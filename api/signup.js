import serverless from 'serverless-http'
import createApp from '../backend/dq-backend-ecommerce/app.js'

const app = createApp()
const handler = serverless(app)

export default async function(req, res) {
  // Ensure Express sees '/signup'
  if (req.url && req.url.startsWith('/api')) {
    req.url = req.url.slice(4) || '/'
  }
  return handler(req, res)
}