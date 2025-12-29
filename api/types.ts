export interface User {
  login: string
  name: string
  avatarUrl: string
}

export type Shape = 'square' | 'squircle' | 'circle'

export interface SvgOptions {
  title: string
  avatarSize: number
  perRow: number
  shape: Shape
  hideLabel: boolean
  fontSize: number
  fontFamily: string
  textColor: string
  backgroundColor: string
  limit: number
  outerBorderWidth: number
  outerBorderColor: string
  outerBorderRadius: number
  margin: number
  textOffset: number
  svgWidth: number
  svgHeight: number
  footerText: string
  dynamic?: boolean
  isResponsive?: boolean
}
