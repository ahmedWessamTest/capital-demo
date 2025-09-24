export function toFormData<T extends object>(data: T):FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key,value])=>{
        if(value) {
            value.forEach((val:any)=>{
                formData.append(key,val)
            })
        }
    })
    return formData;
}
export function cloneFormData(formData: FormData): FormData {
  const newFormData = new FormData();
  formData.forEach((value, key) => {
    newFormData.append(key, value);
  });
  return newFormData;
}
export const formDataToObject = (formData: FormData): Record<string, any> => {
  return Object.fromEntries(formData.entries());
};