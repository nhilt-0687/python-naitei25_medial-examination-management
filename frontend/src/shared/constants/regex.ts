/**
 * Common regex patterns used throughout the application
 */
export const REGEX_PATTERNS = {
  // Email validation
  EMAIL: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,

  // Phone number validation (Vietnamese format)
  PHONE_VN: /^0\d{9}$/,

  // Password validation
  PASSWORD: {
    MIN_LENGTH: /^.{8,}$/,
    HAS_NUMBER: /\d/,
    HAS_LETTER: /[A-Za-z]/,
    HAS_SPECIAL: /[!@#$%^&*(),.?":{}|<>]/,
  },

  // Vietnamese ID Card (CCCD)
  CCCD: /^\d{12}$/,

  // Health Insurance Number (Vietnamese format)
  HEALTH_INSURANCE: /^[A-Za-z]{2}\d{8}$/,

  // OTP validation
  OTP: /^\d{6}$/,

  // Vietnamese name validation
  VIETNAMESE_NAME:
    /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/,

  // Date validation
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,

  // Address validation (Vietnamese characters + numbers + common punctuation)
  ADDRESS:
    /^[a-zA-Z0-9ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s,.-/]{5,255}$/,
} as const

/**
 * Validation functions using the regex patterns
 */
export const VALIDATORS = {
  email: (value: string): boolean => REGEX_PATTERNS.EMAIL.test(value),
  phoneVN: (value: string): boolean => REGEX_PATTERNS.PHONE_VN.test(value),
  cccd: (value: string): boolean => REGEX_PATTERNS.CCCD.test(value),
  healthInsurance: (value: string): boolean => REGEX_PATTERNS.HEALTH_INSURANCE.test(value),
  otp: (value: string): boolean => REGEX_PATTERNS.OTP.test(value),
  vietnameseName: (value: string): boolean => REGEX_PATTERNS.VIETNAMESE_NAME.test(value),
  dateISO: (value: string): boolean => REGEX_PATTERNS.DATE_ISO.test(value),
  address: (value: string): boolean => REGEX_PATTERNS.ADDRESS.test(value),

  password: {
    minLength: (value: string): boolean => REGEX_PATTERNS.PASSWORD.MIN_LENGTH.test(value),
    hasNumber: (value: string): boolean => REGEX_PATTERNS.PASSWORD.HAS_NUMBER.test(value),
    hasLetter: (value: string): boolean => REGEX_PATTERNS.PASSWORD.HAS_LETTER.test(value),
    hasSpecial: (value: string): boolean => REGEX_PATTERNS.PASSWORD.HAS_SPECIAL.test(value),
  },
} as const
