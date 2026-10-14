# Hanif Muhammad — Developer Portfolio

A responsive developer portfolio showcasing my work in **AI/ML, Python, data science, and n8n workflow automation**. The project includes portfolio sections for skills, experience, projects, achievements, and contact, plus a server-backed contact form and private admin inbox.

- **GitHub:** https://github.com/hanifkhan17283-del
- **LinkedIn:** https://www.linkedin.com/in/hanif-khan-770b57354
- **GitLab:** https://gitlab.com/hanifkhan17283-del
- **Medium:** https://medium.com/@hanifkhan17283
- **Email:** hanifkhan17283@gmail.com

## Featured Projects

- Face Detection
- Emotion Detection AI
- House Price Prediction
- Social Media Automation with n8n
- Company Website Chatbot
- Lead Generation Automation with n8n
- Email Automation with n8n

## Tech Stack

- React and JavaScript
- HTML, CSS, and SCSS
- Python and machine learning
- n8n workflow automation
- Node.js and Express for the API
- PostgreSQL for contact inquiries, admin accounts, and sessions
- Nodemailer for email notifications

## Run Locally

### Requirements

- Node.js 20 or later
- npm
- A PostgreSQL database
- SMTP credentials from an email provider

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file in the project root by copying `.env.example`:

   **PowerShell:**

   ```powershell
   Copy-Item .env.example .env
   ```

3. Configure the required values in `.env` using your own database and SMTP provider details. Set `CONTACT_RECIPIENT` to the email address where you want to receive contact form messages. Generate a unique `SESSION_SECRET` with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   **Never commit `.env`, passwords, API keys, or session secrets to GitHub.**

4. Run the database migration and create the first admin account:

   ```bash
   npm run db:migrate
   npm run admin:create
   ```

5. Start the API and frontend in separate terminals:

   Terminal 1:

   ```bash
   npm run start:api
   ```

   Terminal 2:

   ```bash
   npm start
   ```

6. Open the local site at `http://localhost:3000`. The admin sign-in page is at `http://localhost:3000/admin`.

## Contact Form and Admin Inbox

The React frontend sends contact submissions to the Express API. The API validates submissions and stores inquiries in PostgreSQL before attempting email notification through SMTP. The private admin dashboard supports reviewing and managing inquiries and retrying failed email notifications.

To validate the server and build the production frontend, run:

```bash
npm run test:server
npm test -- --watchAll=false
npm run build
```

Email delivery and database persistence must be tested with valid production provider settings.

## Deployment

Deploy the frontend and Express API together as a Node.js web service so they share the same origin. You will also need a persistent PostgreSQL database and an SMTP provider. Configure all secrets as environment variables in your hosting provider—not in source code or frontend variables.

Use the hosting provider's documented build and start commands and run the database migration against the production database before using the site. Test the contact form and email delivery after deployment. A static-only host such as GitHub Pages cannot run the Express API or database-backed admin inbox.