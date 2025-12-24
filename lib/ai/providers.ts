import { deepseek } from '@ai-sdk/deepseek';
import { devToolsMiddleware } from '@ai-sdk/devtools';
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { isTestEnvironment } from '../constants';

const isDev = process.env.NODE_ENV === 'development';

function wrapModel(model: any, middleware?: any): any {
  const middlewares: any[] = [];

  if (middleware) {
    if (Array.isArray(middleware)) {
      middlewares.push(...middleware);
    } else {
      middlewares.push(middleware);
    }
  }

  if (isDev) {
    middlewares.push(devToolsMiddleware());
  }

  if (middlewares.length === 0) {
    return model;
  }

  return wrapLanguageModel({
    model,
    middleware: middlewares.length === 1 ? middlewares[0] : middlewares,
  });
}

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require('./models.mock');
      return customProvider({
        languageModels: {
          'chat-model': chatModel,
          'chat-model-reasoning': reasoningModel,
          'title-model': titleModel,
          'artifact-model': artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        'chat-model': wrapModel(deepseek('deepseek-chat')),
        'chat-model-reasoning': wrapModel(
          deepseek('deepseek-reasoner'),
          extractReasoningMiddleware({ tagName: 'think' })
        ),
        'title-model': wrapModel(deepseek('deepseek-chat')),
        'artifact-model': wrapModel(deepseek('deepseek-chat')),
      },
    });
