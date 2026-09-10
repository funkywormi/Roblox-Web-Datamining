import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import { createOneToOneConversation } from "../services/chatService";

export const useCreateOneToOneConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participantUserId: number) => createOneToOneConversation(participantUserId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() }),
  });
};
