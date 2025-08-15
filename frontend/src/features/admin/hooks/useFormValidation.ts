import { useState, useCallback } from "react"
import type { ValidationRule, ValidationErrors } from "../../utils/validation-types"
import { validateField } from "../../utils/validation-utils"

export const useFormValidation = <T extends Record<string, string>>(
  initialValues: T,
  validationRules: Record<keyof T, ValidationRule>,
) => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)

  const validateFieldInternal = useCallback(
    (name: keyof T, value: string) => {
      const rule = validationRules[name]
      if (!rule) return ""

      const fieldName = String(name)
      return validateField(value, rule, fieldName, values)
    },
    [validationRules, values],
  )

  const handleChange = useCallback(
    (name: keyof T, value: string) => {
      setValues((prev) => ({ ...prev, [name]: value }))

      // Validate on change if field has been touched
      if (touched[name]) {
        const error = validateFieldInternal(name, value)
        setErrors((prev) => ({ ...prev, [name]: error }))
      }
    },
    [touched, validateFieldInternal],
  )

  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }))
      const error = validateFieldInternal(name, values[name])
      setErrors((prev) => ({ ...prev, [name]: error }))
    },
    [values, validateFieldInternal],
  )

  const validateAll = useCallback(() => {
    const newErrors: ValidationErrors = {}
    let isValid = true

    Object.keys(validationRules).forEach((key) => {
      const error = validateFieldInternal(key as keyof T, values[key as keyof T])
      if (error) {
        newErrors[key] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched(
      Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<keyof T, boolean>),
    )

    return isValid
  }, [values, validationRules, validateFieldInternal])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({} as Record<keyof T, boolean>)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.keys(errors).every((key) => !errors[key]),
  }
}
