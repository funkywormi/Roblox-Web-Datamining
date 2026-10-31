import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import { createOneToOneConversation } from "../services/chatService";
import { getStatusCode } from "../utils/getStatusCode";
import { trackError } from "../observability";

export const useCreateOneToOneConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participantUserId: number) => createOneToOneConversation(participantUserId),
    onError: error => {
      trackError("StartConversationFailed", { statusCode: getStatusCode(error) }, error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() }),
  });
};
