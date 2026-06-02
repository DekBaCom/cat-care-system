export class ApiError extends Error {
  constructor(public statusCode: number, message: string, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const UNAUTHORIZED = new ApiError(401, 'กรุณาเข้าสู่ระบบก่อน (Unauthorized)', 'UNAUTHORIZED');
export const FORBIDDEN = new ApiError(403, 'ไม่มีสิทธิ์เข้าถึง (Forbidden)', 'FORBIDDEN');
export const NOT_FOUND = new ApiError(404, 'ไม่พบข้อมูล (Not Found)', 'NOT_FOUND');
export const INVALID_INPUT = new ApiError(400, 'ข้อมูลไม่ถูกต้อง (Invalid Input)', 'INVALID_INPUT');
export const DUPLICATE_EMAIL = new ApiError(409, 'อีเมลนี้ถูกใช้งานแล้ว (Email already exists)', 'DUPLICATE_EMAIL');
export const INVALID_CREDENTIALS = new ApiError(401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง (Invalid credentials)', 'INVALID_CREDENTIALS');
export const SERVER_ERROR = new ApiError(500, 'เกิดข้อผิดพลาดภายในระบบ (Internal Server Error)', 'SERVER_ERROR');

export function errorToResponse(error: Error): { statusCode: number; body: object } {
  if (error instanceof ApiError) {
    return { statusCode: error.statusCode, body: { success: false, error: error.message, code: error.code } };
  }
  return { statusCode: 500, body: { success: false, error: SERVER_ERROR.message, code: 'SERVER_ERROR' } };
}
