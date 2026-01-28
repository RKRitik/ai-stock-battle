import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { groq } from '@ai-sdk/groq';
import { LanguageModel } from 'ai';

type ProviderName = 'google' | 'openai' | 'groq';

type ModelFactory = (modelId: string, settings?: any) => LanguageModel;

export const providerMap: Record<ProviderName, ModelFactory> = {
    google: google,
    openai: openai,
    groq: groq,
};

export function getModel(provider: ProviderName, modelId: string) {
    const factory = providerMap[provider];
    if (!factory) {
        throw new Error(`Provider "${provider}" is not supported or missing from providerMap.`);
    }

    return factory(modelId);
}