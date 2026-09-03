import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { GenericResponse } from "../core/types/common";
import { CreateSupportTicketRequestModel } from "../core/types/supportTicket";

const sendSupportForm = async (
  url: string,
  formData: CreateSupportTicketRequestModel,
): Promise<GenericResponse> => {
  const { data: rData } = await httpService.post<GenericResponse>({ url }, formData);
  return rData;
};

export default sendSupportForm;
