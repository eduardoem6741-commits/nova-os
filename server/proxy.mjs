import express from 'express'
import dns from 'node:dns/promises'
import net from 'node:net'
import { URL } from 'node:url'

const app = express()
const port = Number(process.env.PORT || 8787)
const timeoutMs = 10000
const allowedHosts = new Set((process.env.PROXY_ALLOWLIST || 'example.com,www.example.com,developer.mozilla.org,github.com,raw.githubusercontent.com').split(',').map((host) => host.trim().toLowerCase()).filter(Boolean))

function isPrivateIp(address) {
  if (net.isIPv4(address)) return address === '127.0.0.1' || address.startsWith('10.') || address.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[01])\./.test(address) || address.startsWith('169.254.')
  return address === '::1' || address.startsWith('fc') || address.startsWith('fd') || address.startsWith('fe80:')
}
async function safeTarget(raw) {
  const target = new URL(raw)
  if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Only HTTP and HTTPS URLs are supported')
  if (target.username || target.password) throw new Error('Credentials in URLs are not allowed')
  const host = target.hostname.toLowerCase()
  if (!allowedHosts.has(host) && ![...allowedHosts].some((item) => host.endsWith(`.${item}`))) throw new Error('This domain is not on the proxy allowlist')
  const records = await dns.lookup(host, { all: true })
  if (records.some(({ address }) => isPrivateIp(address))) throw new Error('Private network targets are blocked')
  return target
}
function rewrite(html, base) {
  const proxy = (value) => `/api/proxy?url=${encodeURIComponent(new URL(value, base).toString())}`
  return html.replace(/(src|href|action)=("|')(?!#|data:|javascript:|mailto:|tel:)([^"']+)(\2)/gi, (_, attr, quote, value) => `${attr}=${quote}${proxy(value)}${quote}`)
    .replace(/url\((['"]?)(?!data:)([^)'" ]+)\1\)/gi, (_, quote, value) => `url(${quote}${proxy(value)}${quote})`)
}
app.get('/api/proxy', async (req, res) => {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    if (typeof req.query.url !== 'string') return res.status(400).send('Missing url')
    const target = await safeTarget(req.query.url)
    const response = await fetch(target, { signal: controller.signal, headers: { 'user-agent': 'NovaOS/0.2 browser proxy' } })
    if (!response.ok) return res.status(response.status).send(`Upstream returned ${response.status}`)
    const type = response.headers.get('content-type') || 'application/octet-stream'
    const body = await response.arrayBuffer()
    res.setHeader('X-Content-Type-Options', 'nosniff')
    if (type.includes('text/html')) {
      res.setHeader('Content-Security-Policy', "default-src * data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';")
      return res.type('html').send(rewrite(new TextDecoder().decode(body), target.toString()))
    }
    res.setHeader('Content-Type', type)
    return res.send(Buffer.from(body))
  } catch (error) { return res.status(400).send(error instanceof Error ? error.message : 'Proxy request failed') } finally { clearTimeout(timer) }
})
app.get('/health', (_req, res) => res.json({ ok: true, service: 'NovaOS proxy' }))
app.listen(port, () => console.log(`NovaOS proxy listening on http://localhost:${port}`))
