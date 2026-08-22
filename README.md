# EKTBLY (أكتبلي) - Arabic Speech-to-Text

تطبيق تفريغ صوتي عربي دقيق وسريع لتحويل التسجيلات والملفات الصوتية إلى نصوص عربية مكتوبة بدقة عالية.

---

## 🚀 Cloudflare Deployment

To deploy this project to Cloudflare Workers with static asset hosting:

1. **Set your Gemini API key secret in Cloudflare:**
   ```bash
   npx wrangler secret put GEMINI_API_KEY
   ```

2. **Build and deploy the application:**
   ```bash
   npm run deploy:worker
   ```
   *(or run `npm run build && npx wrangler deploy`)*
