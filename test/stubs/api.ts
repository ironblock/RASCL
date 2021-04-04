export const getExample = () => fetch("example.com", { method: "GET" });
export const putExample = (item?: any) => fetch("example.com", { method: "PUT" });
export const postExample = (item?: any) => fetch("example.com", { method: "POST" });
export const patchExample = (item?: any) => fetch("example.com", { method: "PATCH" });
export const deleteExample = (item?: any) => fetch("example.com", { method: "DELETE" });
