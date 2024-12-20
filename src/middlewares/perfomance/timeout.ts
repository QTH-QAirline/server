import { timeout } from 'hono/timeout';
import { HTTPException } from 'hono/http-exception';

/**
 * Middleware giới hạn thời gian xử lý request
 */
const TIMEOUT_DURATION = Number(process.env.TIMEOUT_DURATION) || 5000; // Mặc định 5000ms (5 giây)

export default timeout(TIMEOUT_DURATION, () => {
  throw new HTTPException(504, { message: 'Request timeout! Máy chủ mất quá nhiều thời gian để xử lý.' });
});
