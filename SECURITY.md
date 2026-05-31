# Security Policy

## Supported Versions

The following versions of Thoth are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Thoth seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do not report security vulnerabilities through public GitHub issues.

Instead, please report them via email to **[your-security-email@example.com](mailto:your-security-email@example.com)**.

Please include the following information in your report:

- **Type of vulnerability** (e.g., XSS, CSRF, SQL injection, etc.)
- **Full paths of source file(s)** related to the manifestation of the vulnerability
- **The location of the affected source code** (tag/branch/commit or direct URL)
- **Any special configuration required** to reproduce the issue
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit it

This information will help us triage your report more quickly.

## Response Process

1. **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours.

2. **Investigation**: We will investigate the issue and determine its impact and severity.

3. **Fix Development**: If the vulnerability is confirmed, we will develop a fix.

4. **Disclosure**: We will work with you to coordinate public disclosure once a fix is available.

## Security Best Practices

### For Users

- **Keep your app updated**: Always use the latest version of Thoth
- **Use strong passwords**: Protect your Google account with a strong, unique password
- **Enable 2FA**: Use two-factor authentication on your Google account
- **Be cautious with sharing**: Don't share sensitive dream data publicly

### For Developers

- **Never commit secrets**: Never commit API keys, passwords, or other secrets to the repository
- **Use environment variables**: Store sensitive configuration in environment variables
- **Validate inputs**: Always validate and sanitize user inputs
- **Keep dependencies updated**: Regularly update dependencies to patch security vulnerabilities
- **Follow OWASP guidelines**: Adhere to OWASP security best practices

## Security Features

Thoth implements the following security measures:

- **Firebase Authentication**: Secure user authentication via Google Sign-In
- **Firestore Security Rules**: Database access controlled by security rules
- **HTTPS Only**: All communications encrypted in transit
- **Input Validation**: User inputs validated on both client and server
- **CORS Protection**: Cross-origin requests properly configured
- **Content Security Policy**: CSP headers to prevent XSS attacks

## Known Security Considerations

### Audio Data

- Audio recordings are stored in Cloudflare R2 or Firebase Storage
- Access to audio files is controlled via signed URLs
- Audio data is not encrypted at rest (considered for future releases)

### AI Processing

- Dream content is sent to Google Gemini API for analysis
- Users can use their own API keys for enhanced privacy
- Data sent to Gemini is subject to Google's data handling policies

### Third-Party Services

Thoth relies on the following third-party services:
- Firebase (Authentication, Firestore, Storage)
- Google Gemini API
- Cloudflare R2

Each service has its own security and privacy policies.

## Security Updates

Security updates will be released as patch versions (e.g., 1.1.1). We recommend:

1. Watching the repository for releases
2. Reading the [CHANGELOG](CHANGELOG.md) for security-related changes
3. Updating promptly when security fixes are released

## Contact

For security-related questions or concerns, please contact:

- **Security Team**: [your-security-email@example.com](mailto:your-security-email@example.com)
- **General Inquiries**: [your-email@example.com](mailto:your-email@example.com)

---

Thank you for helping keep Thoth and our users safe!
