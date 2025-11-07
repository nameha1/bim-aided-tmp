// Form utilities and helpers

export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = {} as T;
  
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (typeof value === 'string') {
      sanitized[key as keyof T] = value.trim() as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  });
  
  return sanitized;
};

export const resetForm = (
  setFormData: (data: any) => void,
  initialState: any
): void => {
  setFormData(initialState);
};

export const handleInputChange = <T extends Record<string, any>>(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setFormData: React.Dispatch<React.SetStateAction<T>>
): void => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

export const handleSelectChange = <T extends Record<string, any>>(
  name: string,
  value: string,
  setFormData: React.Dispatch<React.SetStateAction<T>>
): void => {
  setFormData((prev) => ({ ...prev, [name]: value }));
};

export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });
  
  return formData;
};

export const getFormErrors = <T extends Record<string, any>>(
  data: T,
  validators: Partial<Record<keyof T, (value: any) => string | null>>
): Partial<Record<keyof T, string>> => {
  const errors: Partial<Record<keyof T, string>> = {};
  
  Object.keys(validators).forEach((key) => {
    const validator = validators[key as keyof T];
    if (validator) {
      const error = validator(data[key as keyof T]);
      if (error) {
        errors[key as keyof T] = error;
      }
    }
  });
  
  return errors;
};

export const hasFormErrors = <T extends Record<string, any>>(
  errors: Partial<Record<keyof T, string>>
): boolean => {
  return Object.values(errors).some((error) => error !== null && error !== undefined);
};
