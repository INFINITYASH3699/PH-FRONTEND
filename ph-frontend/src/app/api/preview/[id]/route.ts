import { NextRequest, NextResponse } from 'next/server';

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// This API route will fetch portfolio data from the backend and render it for preview
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  // Use the backend API URL from environment or default
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-hub-yqp0.onrender.com/api';

  try {
    // Extract auth token from the cookies
    const authToken = request.cookies.get('ph_auth_token')?.value;

    if (!authToken) {
      console.error('No auth token found in cookies for preview');
      return new NextResponse('Authentication required to preview portfolio', {
        status: 401,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // Fetch portfolio data with authorization header
    const portfolioResponse = await fetch(`${API_BASE_URL}/portfolios/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`, // Add authorization header
      },
      cache: 'no-store', // Disable caching to ensure fresh data
    });

    // Log response status for debugging
    console.log(`Portfolio preview API response status: ${portfolioResponse.status}`);

    if (!portfolioResponse.ok) {
      // Get the response text for better error logging
      const responseText = await portfolioResponse.text();
      console.error('API response not OK:', responseText);
      throw new Error(`Failed to fetch portfolio data: ${portfolioResponse.status} ${portfolioResponse.statusText}`);
    }

    // Safely parse the JSON
    let data;
    try {
      const text = await portfolioResponse.text();
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error('Invalid JSON response from API');
    }

    if (!data.success || !data.portfolio) {
      console.error('No portfolio data in response:', data);
      return new NextResponse('Portfolio not found', { status: 404 });
    }

    // Generate HTML for the portfolio preview
    const portfolio = data.portfolio;
    const html = generatePortfolioHTML(portfolio);

    // Return the HTML response with CORS headers
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Frame-Options': 'SAMEORIGIN'  // Ensure this content can be loaded in an iframe
      },
    });
  } catch (error) {
    console.error('Error in preview API route:', error);
    return new NextResponse(
      'Failed to generate preview: ' + (error instanceof Error ? error.message : String(error)),
      {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

// Function to generate HTML for the portfolio
function generatePortfolioHTML(portfolio: any) {
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

        ${content?.about ? `
        <section>
          <h2>About Me</h2>
          <div>${content.about.bio || 'No bio information provided.'}</div>
        </section>
        ` : ''}

        ${content?.skills?.length > 0 ? `
        <section>
          <h2>Skills</h2>
          <ul>
            ${content.skills.map((skill: any) => `
              <li>${skill.name} ${skill.proficiency ? `- ${skill.proficiency}%` : ''}</li>
            `).join('')}
          </ul>
        </section>
        ` : ''}

        ${content?.projects?.length > 0 ? `
        <section>
          <h2>Projects</h2>
          ${content.projects.map((project: any) => `
            <div>
              <h3>${project.title}</h3>
              <p>${project.description}</p>
              ${project.projectUrl ? `<p><a href="${project.projectUrl}" target="_blank" rel="noopener noreferrer">View Project</a></p>` : ''}
            </div>
          `).join('')}
        </section>
        ` : ''}

        ${content?.experience?.length > 0 ? `
        <section>
          <h2>Experience</h2>
          ${content.experience.map((exp: any) => `
            <div>
              <h3>${exp.title} at ${exp.company}</h3>
              <p>${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</p>
              <p>${exp.description}</p>
            </div>
          `).join('')}
        </section>
        ` : ''}

        ${content?.education?.length > 0 ? `
        <section>
          <h2>Education</h2>
          ${content.education.map((edu: any) => `
            <div>
              <h3>${edu.degree} - ${edu.institution}</h3>
              <p>${edu.startDate} - ${edu.endDate || 'Present'}</p>
              ${edu.description ? `<p>${edu.description}</p>` : ''}
            </div>
          `).join('')}
        </section>
        ` : ''}

        ${content?.contact ? `
        <section>
          <h2>Contact</h2>
          <p>Email: ${content.contact.email || 'Not provided'}</p>
        </section>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}
