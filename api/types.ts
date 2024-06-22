
export interface User {
  login: string
  name: string
  avatarUrl: string
}

export type Shape = 'square' | 'squircle' | 'circle';

export interface SvgOptions {
  title: string;
  avatarSize: number;
  perRow: number;
  shape: Shape;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  margin: number;
  textOffset: number;
  limit: number;
}