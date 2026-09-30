import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Globe,
  Save,
  Settings as SettingsIcon,
  X,
} from 'lucide-react';
import {
  MODEL_PROVIDERS,
  ModelConfig,
  ModelProvider,
} from '../types';
import {
  getModelConfig,
  setModelConfig,
} from '../services/aiService';
import { useDialogFocus } from '../hooks/useDialogFocus';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROVIDER_ORDER: ModelProvider[] = [
  'gemini',
  'openai',
  'anthropic',
  'deepseek',
  'volcengine',
  'moonshot',
  'qwen',
  'zhipu',
  'xai',
  'groq',
  'mistral',
  'siliconflow',
  'ollama',
  'custom',
];

const PROTOCOL_LABELS = {
  openai: 'OpenAI 兼容',
  anthropic: 'Anthropic',
  gemini: 'Gemini',
} as const;

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<ModelConfig>(getModelConfig());
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { dialogRef, handleKeyDown } = useDialogFocus(isOpen, onClose);

  const providerMeta = MODEL_PROVIDERS[config.provider];
  const apiKeyRequired = providerMeta.needsApiKey;
  const modelRequired = config.provider === 'custom';
  const canSave = (!apiKeyRequired || Boolean(config.apiKey.trim()))
    && (!modelRequired || Boolean(config.model?.trim()));

  const updateConfig = (updates: Partial<ModelConfig>) => {
    setConfig((current) => ({ ...current, ...updates }));
    setFormError(null);
    setSaved(false);
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const apiKeyMissing = apiKeyRequired && !config.apiKey.trim();
    const modelMissing = modelRequired && !config.model?.trim();

    if (apiKeyMissing || modelMissing) {
      setFormError(
        apiKeyMissing
          ? '请输入 API 密钥。'
          : '自定义供应商需要填写模型名称。',
      );
      return;
    }

    setFormError(null);
    setModelConfig(config);
    localStorage.setItem('modelConfig', JSON.stringify(config));
    setSaved(true);
  };

  const handleProviderChange = (provider: ModelProvider) => {
    if (provider === config.provider) return;
    const nextProvider = MODEL_PROVIDERS[provider];
    setConfig({
      provider,
      apiKey: '',
      baseUrl: '',
      model: nextProvider.defaultModels[0] || '',
    });
    setFormError(null);
    setSaved(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    setConfig(getModelConfig());
    setFormError(null);
    setSaved(false);
    setShowApiKey(false);
  }, [isOpen]);

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(timer);
  }, [saved]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm p-3 sm:p-4">
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="关闭设置"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="glass-panel relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-2xl w-full max-h-[calc(100dvh-1.5rem)] overflow-y-auto shadow-2xl animate-fade-in-up outline-none"
      >
        <div className="sticky -top-5 sm:-top-8 z-10 -mx-5 sm:-mx-8 -mt-5 sm:-mt-8 mb-8 flex items-center justify-between border-b border-white/60 bg-white/75 px-5 sm:px-8 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            </div>
            <div>
              <h2 id="settings-title" className="text-2xl font-serif font-bold text-gray-900">UniLLM 模型配置</h2>
              <p className="text-xs text-gray-500 mt-1">统一接入 14 家模型供应商</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="关闭设置"
          >
            <X className="w-5 h-5 text-gray-500" aria-hidden="true" />
          </button>
        </div>

        <form className="space-y-8" onSubmit={handleSave} noValidate>
          <fieldset>
            <legend id="provider-label" className="block text-sm font-medium text-gray-700 mb-3">模型供应商</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROVIDER_ORDER.map((provider) => {
                const meta = MODEL_PROVIDERS[provider];
                const isSelected = config.provider === provider;
                return (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => handleProviderChange(provider)}
                    aria-pressed={isSelected}
                    className={`p-4 rounded-xl border-2 text-left transition-[background-color,border-color,box-shadow,transform] active:scale-[0.99] ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" aria-hidden="true" />}
                      </div>
                      <div className="min-w-0">
                        <div className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                          {meta.label}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {PROTOCOL_LABELS[meta.kind]}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="settings-api-key" className="block text-sm font-medium text-gray-700 mb-2">
              API 密钥 {apiKeyRequired && <span className="text-red-500" aria-hidden="true">*</span>}
            </label>
            <div className="relative">
              <input
                id="settings-api-key"
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(event) => updateConfig({ apiKey: event.target.value })}
                placeholder={apiKeyRequired ? '输入您的 API 密钥' : '本地服务通常无需密钥'}
                autoComplete="off"
                spellCheck={false}
                aria-required={apiKeyRequired}
                aria-invalid={Boolean(formError && apiKeyRequired && !config.apiKey.trim())}
                aria-describedby="settings-api-key-help settings-form-error"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-[border-color,box-shadow] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
                aria-label={showApiKey ? '隐藏 API 密钥' : '显示 API 密钥'}
              >
                {showApiKey ? <EyeOff className="w-5 h-5 text-gray-500" aria-hidden="true" /> : <Eye className="w-5 h-5 text-gray-500" aria-hidden="true" />}
              </button>
            </div>
            <div id="settings-api-key-help" className="mt-2 flex items-start gap-2 text-xs text-gray-500">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <p>密钥仅保存在当前浏览器，不会上传到项目服务器。</p>
            </div>
          </div>

          <div>
            <label htmlFor="settings-base-url" className="block text-sm font-medium text-gray-700 mb-2">
              Base URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input
                id="settings-base-url"
                type="text"
                inputMode="url"
                value={config.baseUrl || ''}
                onChange={(event) => updateConfig({ baseUrl: event.target.value })}
                placeholder={`默认: ${providerMeta.defaultBaseUrl}`}
                autoComplete="url"
                spellCheck={false}
                aria-describedby="settings-base-url-help"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-[border-color,box-shadow] outline-none"
              />
            </div>
            <p id="settings-base-url-help" className="mt-2 text-xs text-gray-500">留空时使用该供应商的默认接口地址。</p>
          </div>

          <div>
            <label htmlFor="settings-model" className="block text-sm font-medium text-gray-700 mb-2">
              模型名称 {modelRequired && <span className="text-red-500" aria-hidden="true">*</span>}
            </label>
            <input
              id="settings-model"
              type="text"
              list="unillm-model-options"
              value={config.model || ''}
              onChange={(event) => updateConfig({ model: event.target.value })}
              placeholder={providerMeta.defaultModels[0] || '输入模型名称'}
              autoComplete="off"
              spellCheck={false}
              aria-required={modelRequired}
              aria-invalid={Boolean(formError && modelRequired && !config.model?.trim())}
              aria-describedby="settings-model-help settings-form-error"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-[border-color,box-shadow] outline-none"
            />
            <datalist id="unillm-model-options">
              {providerMeta.defaultModels.map((model) => (
                <option key={model} value={model} />
              ))}
            </datalist>
            <p id="settings-model-help" className="mt-2 text-xs text-gray-500">
              {providerMeta.note || `推荐模型：${providerMeta.defaultModels.slice(0, 2).join('、') || '请手动填写'}`}
            </p>
          </div>

          {formError && (
            <div id="settings-form-error" role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              className={`w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-[background-color,box-shadow,transform] active:scale-[0.99] ${
                saved
                  ? 'bg-green-600 text-white'
                  : canSave
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-700 text-white hover:bg-gray-800'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" aria-hidden="true" />
                  已保存
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" aria-hidden="true" />
                  保存配置
                </>
              )}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {saved ? '配置已保存' : ''}
            </span>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-blue-800">
              配置由 <strong>UniLLM SDK</strong> 统一适配，支持超时控制、错误分类和输出解析兜底。
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
