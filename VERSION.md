# Portfolio-Hub Version History

## v1.1.0 - April 19, 2025

### Bug Fixes:
1. Fixed issue where user data wasn't being properly fetched in production environment by updating the API URL configuration
2. Fixed missing sections in published portfolios - now all content sections (skills, experience, education, contact, gallery) are properly displayed
3. Enhanced error handling for portfolio data fetching to ensure consistent behavior between development and production environments
4. Added additional logging for debugging portfolio data loading issues

### How to Verify:
- In localhost, user portfolio data should automatically be populated when editing a template
- In production, user portfolio data should now also be populated correctly
- All sections should be visible in published portfolios, not just the title, subtitle, and projects
