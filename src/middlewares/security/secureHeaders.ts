import { secureHeaders } from 'hono/secure-headers';

/**
 * Middleware thêm các HTTP security headers để tăng cường bảo mật ứng dụng
 */
export default secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://trusted.cdn.com"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:"],
    fontSrc: ["'self'", "https://fonts.googleapis.com"],
    connectSrc: ["'self'", "https://api.example.com"],
  },
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: {
    camera: false,
    microphone: false,
    geolocation: ["'self'"],
  },
});
