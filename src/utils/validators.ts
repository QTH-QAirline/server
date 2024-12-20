import { z } from 'zod';

/**
 * Schema cho đăng ký người dùng
 */
export const registerSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100, 'Tên không được quá 100 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  phone: z.string().optional(),
});

/**
 * Schema cho đăng nhập người dùng
 */
export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
});

/**
 * Schema cho yêu cầu đặt lại mật khẩu (quên mật khẩu)
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

/**
 * Schema cho đặt lại mật khẩu mới
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token không được để trống'),
  newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự'),
});
