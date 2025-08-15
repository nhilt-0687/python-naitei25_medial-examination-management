import { VALIDATORS } from "../constants/regex"
import i18n from "../../i18n"

export interface ValidationResult {
  isValid: boolean
  errorMessage?: string
}

/**
 * Validation utility functions with i18n support
 */
export const ValidationUtils = {
  validateEmail(email: string): ValidationResult {
    if (!email.trim()) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.emailRequired"),
      }
    }

    if (!VALIDATORS.email(email.trim())) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.emailInvalid"),
      }
    }

    return { isValid: true }
  },

  validatePhoneVN(phone: string): ValidationResult {
    if (!phone.trim()) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.phoneRequired"),
      }
    }

    if (!VALIDATORS.phoneVN(phone.trim())) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.phoneInvalid"),
      }
    }

    return { isValid: true }
  },

  validatePassword(password: string): ValidationResult {
    if (!password) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.passwordRequired"),
      }
    }

    if (!VALIDATORS.password.minLength(password)) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.passwordMinLength"),
      }
    }

    if (!VALIDATORS.password.hasNumber(password)) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.passwordNeedsNumber"),
      }
    }

    if (!VALIDATORS.password.hasLetter(password)) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.passwordNeedsLetter"),
      }
    }

    if (!VALIDATORS.password.hasSpecial(password)) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.passwordNeedsSpecial"),
      }
    }

    return { isValid: true }
  },

  validateCCCD(cccd: string): ValidationResult {
    if (!cccd.trim()) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.cccdRequired"),
      }
    }

    if (!VALIDATORS.cccd(cccd.trim())) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.cccdInvalid"),
      }
    }

    return { isValid: true }
  },

  validateHealthInsurance(insurance: string): ValidationResult {
    if (!insurance.trim()) {
      return { isValid: true } // Optional field
    }

    if (!VALIDATORS.healthInsurance(insurance.trim())) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.healthInsuranceInvalid"),
      }
    }

    return { isValid: true }
  },

  validateOTP(otp: string): ValidationResult {
    if (!otp.trim()) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.otpRequired"),
      }
    }

    if (!VALIDATORS.otp(otp.trim())) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.otpInvalid"),
      }
    }

    return { isValid: true }
  },

  validateFullName(name: string): ValidationResult {
    if (!name.trim()) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.fullNameRequired"),
      }
    }

    if (!VALIDATORS.vietnameseName(name.trim())) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.nameInvalid"),
      }
    }

    return { isValid: true }
  },

  validateDateOfBirth(date: string): ValidationResult {
    if (!date) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.dateOfBirthRequired"),
      }
    }

    if (!VALIDATORS.dateISO(date)) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.dateInvalid"),
      }
    }

    // Check if date is not in the future
    const today = new Date()
    const birthDate = new Date(date)
    if (birthDate >= today) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.dateOfBirthInvalid"),
      }
    }

    return { isValid: true }
  },

  validateAddress(address: string): ValidationResult {
    if (!address.trim()) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.addressRequired"),
      }
    }

    if (address.trim().length > 255) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.addressTooLong"),
      }
    }

    if (!VALIDATORS.address(address.trim())) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.addressInvalid"),
      }
    }

    return { isValid: true }
  },

  validateEmailOrPhone(email: string, phone: string): ValidationResult {
    if (!email.trim() && !phone.trim()) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.emailOrPhoneRequired"),
      }
    }

    if (email.trim()) {
      const emailResult = this.validateEmail(email)
      if (!emailResult.isValid) {
        return emailResult
      }
    }

    if (phone.trim()) {
      const phoneResult = this.validatePhoneVN(phone)
      if (!phoneResult.isValid) {
        return phoneResult
      }
    }

    return { isValid: true }
  },

  validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
    if (password !== confirmPassword) {
      return {
        isValid: false,
        errorMessage: i18n.t("validation.passwordMismatch"),
      }
    }

    return { isValid: true }
  },
}
