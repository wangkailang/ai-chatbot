'use client';

import { useEffect, useState } from 'react';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from './elements/reasoning';

type MessageReasoningProps = {
  isLoading: boolean;
  reasoningText: string;
};

export function MessageReasoning({
  isLoading,
  reasoningText,
}: MessageReasoningProps) {
  const [hasBeenStreaming, setHasBeenStreaming] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setHasBeenStreaming(true);
    }
  }, [isLoading]);

  return (
    <Reasoning
      data-testid="message-reasoning"
      defaultOpen={hasBeenStreaming}
      isStreaming={isLoading}
    >
      <ReasoningTrigger />
      <ReasoningContent>{reasoning}</ReasoningContent>
    </Reasoning>
  );
}
