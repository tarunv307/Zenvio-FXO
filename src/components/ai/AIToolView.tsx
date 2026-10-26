import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Copy, Check, RotateCcw, AlertTriangle, ShieldCheck,
  Info, ExternalLink, Key, Loader2, StopCircle, ArrowRight
} from 'lucide-react';
import { Button } from '../ui/FormElements';
import { copyToClipboard } from '../../utils/file';
import { requestAI, checkAIBackendStatus } from '../../lib/aiClient';

export interface OptionConfig {
  id: string;
  label: string;
  type: 'select';
  options: { value: string; label: string }[];
  defaultValue: string;
}

export interface AIToolViewProps {
  toolId: string;
  title: string;
  description: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  defaultInput?: string;
  examplePrompt?: string;
  outputLabel?: string;
  optionsConfig?: OptionConfig[];
  privacyNote?: string;
}

export function AIToolView({
  toolId,
  title,
  description,
  inputLabel = 'Your Input',
  inputPlaceholder = 'Enter or paste content here...',
  defaultInput = '',
  examplePrompt,
  outputLabel = 'Generated AI Output',
  optionsConfig = [],
  privacyNote,
}: AIToolViewProps) {
  const [input, setInput] = useState<string>(defaultInput);
  const [output, setOutput] = useState<string>('');
  const [options, setOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    optionsConfig.forEach((opt) => {
      initial[opt.id] = opt.defaultValue;
    });
    return initial;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [providerName, setProviderName] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check server configuration status on mount
  useEffect(() => {
    checkAIBackendStatus().then((status) => {
      setIsConfigured(status.configured);
      setProviderName(status.provider);
    });
  }, []);

  const handleOptionChange = (id: string, value: string) => {
    setOptions((prev) => ({ ...prev, [id]: value }));
  };

  const handleUseExample = () => {
    if (examplePrompt) {
      setInput(examplePrompt);
      setError(null);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Please provide some input text to process.');
      return;
    }

    setLoading(true);
    setError(null);
    setOutput('');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await requestAI({
        tool: toolId,
        input,
        options,
        signal: controller.signal,
      });

      if (!result.ok) {
        if (result.configured === false) {
          setIsConfigured(false);
        }
        setError(result.error || 'An error occurred while generating AI output.');
      } else if (result.output) {
        setOutput(result.output);
        setIsConfigured(true);
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred while contacting AI service.');
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCopy = async () => {
    if (output) {
      await copyToClipboard(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const outputWordCount = output.trim() ? output.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6">
      {/* Privacy Notice Banner */}
      <div className="p-3.5 bg-[#EFF6FF] border border-blue-100 rounded-xl text-xs text-[#1E40AF] flex items-start gap-2.5">
        <ShieldCheck className="size-4 shrink-0 text-[#2563EB] mt-0.5" />
        <div className="leading-relaxed">
          <strong>Privacy & Security Guarantee:</strong> Content is sent directly to the configured AI provider through our secure server endpoint. Your prompts and documents are processed in-memory and are never stored on our servers, tracked, or shared with analytics or advertisers.
          {privacyNote && <span className="block mt-0.5">{privacyNote}</span>}
        </div>
      </div>

      {/* Main Grid: Input & Options (Left) / Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Options */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card space-y-5">
            {/* Header with Title & Example Button */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                  <Sparkles className="size-4 text-[#2563EB]" />
                  {inputLabel}
                </h3>
              </div>

              {examplePrompt && (
                <button
                  type="button"
                  onClick={handleUseExample}
                  className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline flex items-center gap-1"
                >
                  Load Example Prompt
                </button>
              )}
            </div>

            {/* Configurable Tool Options */}
            {optionsConfig.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                {optionsConfig.map((opt) => (
                  <div key={opt.id}>
                    <label className="text-xs font-semibold text-[#64748B] mb-1 block">
                      {opt.label}
                    </label>
                    <select
                      value={options[opt.id] || opt.defaultValue}
                      onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-colors"
                    >
                      {opt.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* Input Textarea */}
            <div>
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={inputPlaceholder}
                rows={9}
                maxLength={8000}
                className="w-full p-3.5 text-sm border border-[#E2E8F0] rounded-xl bg-white text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-colors resize-y font-sans leading-relaxed"
              />

              <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1.5 px-0.5">
                <span>{wordCount} words • {input.length} characters</span>
                <span>Max 8,000 characters</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-[#DC2626] rounded-xl text-xs flex items-start gap-2">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {!loading ? (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!input.trim()}
                  className="flex-1 justify-center py-2.5"
                >
                  <Sparkles className="size-4 mr-1.5" />
                  Generate with AI
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 justify-center py-2.5 text-[#DC2626] border-red-200 hover:bg-red-50"
                >
                  <StopCircle className="size-4 mr-1.5" />
                  Cancel Generation
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                disabled={!input && !output}
                className="text-xs"
              >
                <RotateCcw className="size-3.5 mr-1" />
                Clear
              </Button>
            </div>
          </form>

          {/* Provider Status Indicator */}
          <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#64748B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${
                  isConfigured ? 'bg-[#16A34A] animate-pulse' : 'bg-[#D97706]'
                }`}
              />
              <span>
                {isConfigured
                  ? `AI Provider Connected (${providerName || 'Live API'})`
                  : 'AI Provider: Awaiting API Key in Server Env'}
              </span>
            </div>

            <span className="text-[11px] text-[#94A3B8]">Secure Server Proxy</span>
          </div>
        </div>

        {/* Right Column: Output & Provider Guidance */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card space-y-4 min-h-[380px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                  <Check className="size-4 text-[#2563EB]" />
                  {outputLabel}
                </h3>
                {output && (
                  <span className="text-xs text-[#64748B]">
                    {outputWordCount} words
                  </span>
                )}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="size-8 text-[#2563EB] animate-spin" />
                  <p className="text-sm font-semibold text-[#0F172A]">AI is analyzing and drafting...</p>
                  <p className="text-xs text-[#64748B] max-w-xs">
                    Synthesizing response according to your parameters.
                  </p>
                </div>
              )}

              {/* Unconfigured Provider Guidance Banner */}
              {!loading && !output && isConfigured === false && (
                <div className="p-5 bg-slate-50 border border-[#E2E8F0] rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                    <Key className="size-4 text-[#2563EB]" />
                    AI Provider Setup Required
                  </div>

                  <p className="text-xs text-[#475569] leading-relaxed">
                    This tool is connected to Zenvio's secure server proxy (<code>/api/ai</code>), but an AI provider API key has not been configured in the server environment yet.
                  </p>

                  <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-xs font-mono text-[#0F172A] space-y-1">
                    <p className="text-[#64748B] font-sans font-medium text-[11px]">
                      Add one of these keys to your server <code>.env</code> file:
                    </p>
                    <p className="text-[#2563EB]">OPENAI_API_KEY=sk-your-openai-key-here</p>
                    <p className="text-[#64748B]"># or Google Gemini:</p>
                    <p className="text-[#16A34A]">GEMINI_API_KEY=your-gemini-key-here</p>
                  </div>

                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    Once set, restart the server and live AI generation will activate immediately across all 15 AI tools. Zenvio FXO adheres to strict transparency and never generates misleading hardcoded fake results.
                  </p>
                </div>
              )}

              {/* Empty Placeholder State */}
              {!loading && !output && isConfigured !== false && (
                <div className="py-20 flex flex-col items-center justify-center text-center text-[#64748B] space-y-2">
                  <Sparkles className="size-10 stroke-1 text-slate-300" />
                  <p className="text-sm font-medium">Ready to generate</p>
                  <p className="text-xs max-w-xs text-[#94A3B8]">
                    Enter your content on the left and click "Generate with AI" to receive structured output.
                  </p>
                </div>
              )}

              {/* Formatted Output Display */}
              {!loading && output && (
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] whitespace-pre-wrap font-sans leading-relaxed max-h-[460px] overflow-y-auto">
                  {output}
                </div>
              )}
            </div>

            {/* Output Footer Actions */}
            {output && (
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <span className="text-xs text-[#64748B]">
                  Generated via secure Zenvio AI Pipeline
                </span>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="text-xs"
                  >
                    {copied ? (
                      <><Check className="size-3.5 text-[#16A34A] mr-1.5" /> Copied to Clipboard</>
                    ) : (
                      <><Copy className="size-3.5 mr-1.5" /> Copy Output</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
