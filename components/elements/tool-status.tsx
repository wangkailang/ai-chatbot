import type { ToolUIPart } from 'ai';
import {
  CheckCircleIcon,
  CircleIcon,
  ClockIcon,
  ShieldCheck,
  ShieldQuestion,
  ShieldX,
  XCircleIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

export const toolStatusLabels: Record<ToolUIPart['state'], string> = {
  'input-streaming': 'Pending',
  'input-available': 'Running',
  'approval-requested': 'Approval Required',
  'approval-responded': 'Approved',
  'output-available': 'Completed',
  'output-error': 'Error',
  'output-denied': 'Denied',
};

export const toolStatusIcons: Record<ToolUIPart['state'], ReactNode> = {
  'input-streaming': <CircleIcon className="size-4" />,
  'input-available': <ClockIcon className="size-4 animate-pulse" />,
  'approval-requested': <ShieldQuestion className="size-4 text-yellow-600" />,
  'approval-responded': <ShieldCheck className="size-4 text-blue-600" />,
  'output-available': <CheckCircleIcon className="size-4 text-green-600" />,
  'output-error': <XCircleIcon className="size-4 text-red-600" />,
  'output-denied': <ShieldX className="size-4 text-red-600" />,
};
