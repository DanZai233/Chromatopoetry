import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Eye, EyeOff, Check, Globe, AlertCircle } from 'lucide-react';
import { ModelConfig, ModelProvider, MODEL_PROVIDERS } from '../types';
import { setModelConfig, getModelConfig } from '../services/aiService';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<ModelConfig>(getModelConfig());
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const providers: { key: ModelProvider; name: string; icon?: string }[] = [
    { key: 'gemini', name: MODEL_PROVIDERS.gemini.name },
    { key: 'openai', name: MODEL_PROVIDERS.openai.name },
    { key: 'deepseek', name: MODEL_PROVIDERS.deepseek.name },
    { key: 'openrouter', name: MODEL_PROVIDERS.openrouter.name },
    { key: 'volcengine', name: MODEL_PROVIDERS.volcengine.name },
  ];

  const handleSave = () => {
    if (!config.apiKey.trim()) {
      alert('请输入API密钥');
      return;
    }
    setModelConfig(config);
    localStorage.setItem('modelConfig', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleProviderChange = (provider: ModelProvider) => {
    const providerInfo = MODEL_PROVIDERS[provider];
    setConfig({
      provider,
      apiKey: '',
      baseUrl: providerInfo.baseUrl,
      model: providerInfo.defaultModel
    });
  };

  useEffect(() => {
    const savedConfig = localStorage.getItem('modelConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        setModelConfig(parsed);
      } catch (e) {
        console.error('Failed to parse saved config', e);
      }
    }
  }, []);

  const showBaseUrlField = ['openai', 'deepseek', 'openrouter', 'volcengine'].includes(config.provider);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`glass-panel rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up ${isOpen ? 'scale-100' : 'scale-95'} transition-transform`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">模型配置</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">选择模型供应商</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {providers.map((provider) => (
                <button
                  key={provider.key}
                  onClick={() => handleProviderChange(provider.key)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    config.provider === provider.key
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {config.provider === provider.key && (
                      <Check className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    )}
                    <span className={`font-medium ${config.provider === provider.key ? 'text-indigo-900' : 'text-gray-700'}`}>
                      {provider.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API 密钥 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="输入您的API密钥"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {showApiKey ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
              </button>
            </div>
            <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>API密钥将仅存储在本地浏览器中，不会上传到服务器</p>
            </div>
          </div>

          {showBaseUrlField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base URL (可选)
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={config.baseUrl || ''}
                  onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                  placeholder={`默认: ${MODEL_PROVIDERS[config.provider].baseUrl}`}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              模型名称
            </label>
            <input
              type="text"
              value={config.model || ''}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              placeholder={`默认: ${MODEL_PROVIDERS[config.provider].defaultModel}`}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={!config.apiKey.trim()}
              className={`w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" />
                  已保存
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  保存配置
                </>
              )}
            </button>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-blue-800">
              <strong>提示:</strong> 配置将保存在您的浏览器本地存储中。更换浏览器或清除缓存后需要重新配置。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
