import jwt, { SignOptions } from 'jsonwebtoken';

export const generateAccessToken = (id: string) => {
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'] };
  return jwt.sign({ id }, process.env.JWT_SECRET as string, options);
};

export const generateRefreshToken = (id: string) => {
  const options: SignOptions = { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as SignOptions['expiresIn'] };
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, options);
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
