import express from 'express';
import { auth } from '../middleware/auth';
import upload, { handleMulterError } from '../middleware/upload';
import {
  createPortfolio,
  getUserPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
  getPortfolioBySubdomain,
  uploadPortfolioImage,
  deletePortfolioImage,
} from '../controllers/portfolioController';

// Add a new function for portfolio preview
const generatePortfolioHTML = (portfolio: any) => {
  // Extract necessary data from the portfolio
  const { title, subtitle, content } = portfolio;

  // Create a basic HTML structure for the portfolio preview
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title || 'Portfolio Preview'}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          color: #333;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eaeaea;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        h2 {
          font-size: 1.5rem;
          color: #666;
          font-weight: normal;
        }
        section {
          margin-bottom: 2rem;
        }
        .preview-notice {
          background-color: #fffbea;
          border: 1px solid #ffe58f;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 2rem;
          text-align: center;
        }
      </style>
      ${content?.customCss ? `<style>${content.customCss}</style>` : ''}
    </head>
    <body>
      <div class="preview-notice">
        <strong>Preview Mode</strong> - This is a preview of how your portfolio will look.
      </div>
      <div class="container">
        <header>
          <h1>${title || 'My Portfolio'}</h1>
          ${subtitle ? `<h2>${subtitle}</h2>` : ''}
        </header>

        ${
          content?.about
            ? `
        <section>
          <h2>About Me</h2>
          <div>${content.about.bio || 'No bio information provided.'}</div>
        </section>
        `
            : ''
        }

        ${
          content?.skills?.categories?.length > 0
            ? `
        <section>
          <h2>Skills</h2>
          <ul>
            ${content.skills.categories
              .map(
                (category: any) => `
              <h3>${category.name}</h3>
              <ul>
                ${category.skills
                  .map(
                    (skill: any) =>
                      `<li>${skill.name} ${
                        skill.proficiency ? `- ${skill.proficiency}%` : ''
                      }</li>`
                  )
                  .join('')}
              </ul>
            `
              )
              .join('')}
          </ul>
        </section>
        `
            : ''
        }

        ${
          content?.projects?.items?.length > 0
            ? `
        <section>
          <h2>Projects</h2>
          ${content.projects.items
            .map(
              (project: any) => `
            <div>
              <h3>${project.title}</h3>
              <p>${project.description}</p>
              ${
                project.projectUrl
                  ? `<p><a href="${project.projectUrl}" target="_blank" rel="noopener noreferrer">View Project</a></p>`
                  : ''
              }
            </div>
          `
            )
            .join('')}
        </section>
        `
            : ''
        }

        ${
          content?.experience?.items?.length > 0
            ? `
        <section>
          <h2>Experience</h2>
          ${content.experience.items
            .map(
              (exp: any) => `
            <div>
              <h3>${exp.title} at ${exp.company}</h3>
              <p>${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</p>
              <p>${exp.description}</p>
            </div>
          `
            )
            .join('')}
        </section>
        `
            : ''
        }

        ${
          content?.education?.items?.length > 0
            ? `
        <section>
          <h2>Education</h2>
          ${content.education.items
            .map(
              (edu: any) => `
            <div>
              <h3>${edu.degree} - ${edu.institution}</h3>
              <p>${edu.startDate} - ${edu.endDate || 'Present'}</p>
              ${edu.description ? `<p>${edu.description}</p>` : ''}
            </div>
          `
            )
            .join('')}
        </section>
        `
            : ''
        }

        ${
          content?.contact
            ? `
        <section>
          <h2>Contact</h2>
          <p>Email: ${content.contact.email || 'Not provided'}</p>
        </section>
        `
            : ''
        }
      </div>
    </body>
    </html>
  `;
};

// Create preview handler that serves HTML
const previewPortfolio = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    // Fetch the portfolio from database
    const Portfolio = require('../models/Portfolio').default;
    const portfolio = await Portfolio.findById(id).populate('templateId', 'name category');

    if (!portfolio) {
      return res.status(404).send('Portfolio not found');
    }

    // Generate HTML for preview
    const html = generatePortfolioHTML(portfolio);

    // Set appropriate headers
    res.header('Content-Type', 'text/html');
    res.header('Access-Control-Allow-Origin', '*'); // Allow CORS for preview

    // Send the HTML
    return res.send(html);
  } catch (error) {
    console.error('Error in preview route:', error);
    return res.status(500).send('Failed to generate preview');
  }
};

const router = express.Router();

// Public portfolio routes
router.get('/subdomain/:subdomain', getPortfolioBySubdomain as express.RequestHandler);

// Add the preview route - no authentication required for easy access
router.get('/preview/:id', previewPortfolio);

// Protected portfolio routes
router.use(auth as express.RequestHandler); // All routes below this line require authentication
router.post('/', createPortfolio as express.RequestHandler);
router.get('/', getUserPortfolios as express.RequestHandler);
router.get('/:id', getPortfolioById as express.RequestHandler);
router.put('/:id', updatePortfolio as express.RequestHandler);
router.delete('/:id', deletePortfolio as express.RequestHandler);

// Portfolio image upload/delete routes
router.post(
  '/:id/upload-image',
  upload.single('image'),
  handleMulterError,
  uploadPortfolioImage as express.RequestHandler
);
router.delete('/:id/delete-image/:imageId', deletePortfolioImage as express.RequestHandler);

export default router;
