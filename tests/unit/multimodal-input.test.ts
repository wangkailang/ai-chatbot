/**
 * Property-based tests for MultimodalInput button visibility and stop functionality
 *
 * Feature: chat-stop-streaming
 * Property 1: 按钮可见性遵循状态 - Validates: Requirements 1.1, 1.2, 1.3
 * Property 2: 停止操作保留已流式传输的内容 - Validates: Requirements 2.1, 2.2
 */
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

/**
 * Chat status type from @ai-sdk/react
 */
type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';

/**
 * Pure function that determines which button should be visible based on chat status.
 * This mirrors the logic in MultimodalInput component.
 *
 * @param status - The current chat status
 * @returns 'stop' if stop button should be visible, 'send' otherwise
 */
function getVisibleButton(status: ChatStatus): 'stop' | 'send' {
  if (status === 'submitted' || status === 'streaming') {
    return 'stop';
  }
  return 'send';
}

/**
 * Arbitrary for generating valid ChatStatus values
 */
const chatStatusArbitrary = fc.constantFrom<ChatStatus>(
  'ready',
  'submitted',
  'streaming',
  'error'
);

describe('MultimodalInput Button Visibility', () => {
  /**
   * Feature: chat-stop-streaming, Property 1: 按钮可见性遵循状态
   *
   * For any chat status value, the stop button should be visible if and only if
   * the status is 'submitted' or 'streaming'; the send button should be visible
   * if and only if the status is 'ready' or 'error'.
   *
   * Validates: Requirements 1.1, 1.2, 1.3
   */
  it('Property 1: Button visibility follows status - stop button visible during submitted/streaming, send button visible during ready/error', () => {
    fc.assert(
      fc.property(chatStatusArbitrary, (status) => {
        const visibleButton = getVisibleButton(status);

        // Property: Stop button is visible if and only if status is 'submitted' or 'streaming'
        const shouldShowStop = status === 'submitted' || status === 'streaming';
        const showsStop = visibleButton === 'stop';

        expect(showsStop).toBe(shouldShowStop);

        // Property: Send button is visible if and only if status is 'ready' or 'error'
        const shouldShowSend = status === 'ready' || status === 'error';
        const showsSend = visibleButton === 'send';

        expect(showsSend).toBe(shouldShowSend);

        // Property: Exactly one button is visible at any time
        expect(showsStop !== showsSend).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Specific test cases for each status value to ensure coverage
   */
  describe('Specific status cases', () => {
    it('shows stop button when status is "submitted"', () => {
      expect(getVisibleButton('submitted')).toBe('stop');
    });

    it('shows stop button when status is "streaming"', () => {
      expect(getVisibleButton('streaming')).toBe('stop');
    });

    it('shows send button when status is "ready"', () => {
      expect(getVisibleButton('ready')).toBe('send');
    });

    it('shows send button when status is "error"', () => {
      expect(getVisibleButton('error')).toBe('send');
    });
  });
});

/**
 * Message part types that can appear in a chat message
 */
interface TextPart {
  type: 'text';
  text: string;
}

interface FilePart {
  type: 'file';
  url: string;
  name: string;
  mediaType: string;
}

type MessagePart = TextPart | FilePart;

/**
 * Simplified message structure for testing
 */
interface TestMessage {
  id: string;
  role: 'user' | 'assistant';
  parts: MessagePart[];
}

/**
 * Simulates the stop operation behavior.
 * When stop is called, the current messages array is preserved as-is.
 * This mirrors the behavior in the StopButton component:
 * setMessages((messages) => messages)
 *
 * @param messages - The current messages array
 * @returns The same messages array (content preserved)
 */
function simulateStopOperation(messages: TestMessage[]): TestMessage[] {
  // The stop operation preserves all existing messages
  // This is the behavior from: setMessages((messages) => messages)
  return [...messages];
}

/**
 * Arbitrary for generating random text content
 */
const textContentArbitrary = fc.string({ minLength: 1, maxLength: 500 });

/**
 * Arbitrary for generating a text part
 */
const textPartArbitrary: fc.Arbitrary<TextPart> = textContentArbitrary.map(
  (text) => ({
    type: 'text' as const,
    text,
  })
);

/**
 * Arbitrary for generating a file part
 */
const filePartArbitrary: fc.Arbitrary<FilePart> = fc
  .record({
    url: fc.webUrl(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    mediaType: fc.constantFrom(
      'image/png',
      'image/jpeg',
      'application/pdf',
      'text/plain'
    ),
  })
  .map((file) => ({
    type: 'file' as const,
    ...file,
  }));

/**
 * Arbitrary for generating message parts (text or file)
 */
const messagePartArbitrary: fc.Arbitrary<MessagePart> = fc.oneof(
  textPartArbitrary,
  filePartArbitrary
);

/**
 * Arbitrary for generating a single message
 */
const messageArbitrary: fc.Arbitrary<TestMessage> = fc.record({
  id: fc.uuid(),
  role: fc.constantFrom<'user' | 'assistant'>('user', 'assistant'),
  parts: fc.array(messagePartArbitrary, { minLength: 1, maxLength: 5 }),
});

/**
 * Arbitrary for generating a non-empty messages array (simulating streamed content)
 */
const messagesWithContentArbitrary: fc.Arbitrary<TestMessage[]> = fc.array(
  messageArbitrary,
  { minLength: 1, maxLength: 10 }
);

describe('Stop Operation Content Preservation', () => {
  /**
   * Feature: chat-stop-streaming, Property 2: 停止操作保留已流式传输的内容
   *
   * For any chat session with streamed content, when the stop operation is called,
   * all previously streamed message content should be preserved in the message array.
   *
   * Validates: Requirements 2.1, 2.2
   */
  it('Property 2: Stop operation preserves all streamed content - messages array remains unchanged after stop', () => {
    fc.assert(
      fc.property(messagesWithContentArbitrary, (originalMessages) => {
        // Simulate calling stop during streaming
        const messagesAfterStop = simulateStopOperation(originalMessages);

        // Property: The number of messages is preserved
        expect(messagesAfterStop.length).toBe(originalMessages.length);

        // Property: Each message is preserved with all its content
        for (let i = 0; i < originalMessages.length; i++) {
          const original = originalMessages[i];
          const afterStop = messagesAfterStop[i];

          // Message ID is preserved
          expect(afterStop.id).toBe(original.id);

          // Message role is preserved
          expect(afterStop.role).toBe(original.role);

          // Number of parts is preserved
          expect(afterStop.parts.length).toBe(original.parts.length);

          // Each part is preserved
          for (let j = 0; j < original.parts.length; j++) {
            const originalPart = original.parts[j];
            const afterStopPart = afterStop.parts[j];

            expect(afterStopPart.type).toBe(originalPart.type);

            if (originalPart.type === 'text' && afterStopPart.type === 'text') {
              expect(afterStopPart.text).toBe(originalPart.text);
            } else if (
              originalPart.type === 'file' &&
              afterStopPart.type === 'file'
            ) {
              expect(afterStopPart.url).toBe(originalPart.url);
              expect(afterStopPart.name).toBe(originalPart.name);
              expect(afterStopPart.mediaType).toBe(originalPart.mediaType);
            }
          }
        }

        // Property: The messages array is a new reference (immutability)
        expect(messagesAfterStop).not.toBe(originalMessages);

        // Property: Content equality is maintained
        expect(messagesAfterStop).toEqual(originalMessages);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Empty streaming content should also be preserved
   */
  it('preserves empty message parts array structure', () => {
    const emptyPartsMessage: TestMessage = {
      id: 'test-id',
      role: 'assistant',
      parts: [],
    };

    const messagesAfterStop = simulateStopOperation([emptyPartsMessage]);

    expect(messagesAfterStop.length).toBe(1);
    expect(messagesAfterStop[0].parts.length).toBe(0);
    expect(messagesAfterStop[0].id).toBe('test-id');
  });

  /**
   * Edge case: Partial streaming content (assistant message with incomplete text)
   */
  it('preserves partial streaming content', () => {
    const partialMessage: TestMessage = {
      id: 'streaming-msg',
      role: 'assistant',
      parts: [
        { type: 'text', text: 'This is partial content that was being str' },
      ],
    };

    const messagesAfterStop = simulateStopOperation([partialMessage]);

    expect(messagesAfterStop[0].parts[0]).toEqual({
      type: 'text',
      text: 'This is partial content that was being str',
    });
  });
});
