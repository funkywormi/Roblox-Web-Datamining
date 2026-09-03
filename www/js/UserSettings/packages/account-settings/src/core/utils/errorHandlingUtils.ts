import { TError } from "../../types/commonTypes";

const errorHandler = {
  getErrorParam: (error: TError): Record<string, string> => {
    const errorCode = error?.errors?.[0]?.code ?? -1;
    const errorParams = { errorCode: errorCode.toString() };
    return errorParams;
  },
};

export default errorHandler;
