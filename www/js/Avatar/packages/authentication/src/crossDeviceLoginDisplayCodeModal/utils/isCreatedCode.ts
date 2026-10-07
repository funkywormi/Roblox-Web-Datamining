export type CreatedCode = {
  status: "Created";
  code: string;
  privateKey: string;
  imagePath?: string;
};

/** Whether a create-code response carries a code the modal can show and poll. */
export const isCreatedCode = (data?: Partial<CreatedCode> | null): data is CreatedCode =>
  data?.status === "Created" && Boolean(data.code) && Boolean(data.privateKey);
