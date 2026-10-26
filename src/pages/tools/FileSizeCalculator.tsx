import React, { useState } from 'react';
import { HardDrive, Wifi, Film, Music, Camera } from 'lucide-react';
import { Input, Select } from '../../components/ui/FormElements';
import { formatBytes } from '../../utils/file';

export function FileSizeCalculator() {
  const [sizeVal, setSizeVal] = useState<number>(500);
  const [unit, setUnit] = useState<'MB' | 'GB' | 'TB' | 'KB'>('MB');

  const unitMultipliers: Record<string, number> = {
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
  };

  const totalBytes = sizeVal * (unitMultipliers[unit] || 1);

  // Estimates
  const mp3Count = Math.floor(totalBytes / (5 * 1024 * 1024));
  const photoCount = Math.floor(totalBytes / (4 * 1024 * 1024));
  const hdVideoHours = (totalBytes / (1.5 * 1024 * 1024 * 1024)).toFixed(1);
  const uhd4kHours = (totalBytes / (7 * 1024 * 1024 * 1024)).toFixed(1);

  // Download times
  const downloadSecondsAt100Mbps = (totalBytes * 8) / (100 * 1000 * 1000);
  const downloadSecondsAt1Gbps = (totalBytes * 8) / (1000 * 1000 * 1000);

  const formatDuration = (sec: number) => {
    if (sec < 60) return `${Math.ceil(sec)} seconds`;
    if (sec < 3600) return `${(sec / 60).toFixed(1)} minutes`;
    return `${(sec / 3600).toFixed(1)} hours`;
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-pink-500" /> Digital File Size & Storage Estimator
        </h3>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              label="Enter File / Storage Size"
              type="number"
              value={sizeVal}
              onChange={(e) => setSizeVal(Number(e.target.value))}
            />
          </div>
          <div className="w-32 pt-6">
            <Select
              value={unit}
              onChange={(e) => setUnit(e.target.value as any)}
              options={[
                { value: 'KB', label: 'Kilobytes (KB)' },
                { value: 'MB', label: 'Megabytes (MB)' },
                { value: 'GB', label: 'Gigabytes (GB)' },
                { value: 'TB', label: 'Terabytes (TB)' },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Storage Capacity */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Can Store Approximately
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Music className="w-4 h-4 text-pink-500" /> MP3 Songs (~5MB each)
              </span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-100">~{mp3Count.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Camera className="w-4 h-4 text-pink-500" /> 12MP Photos (~4MB each)
              </span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-100">~{photoCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Film className="w-4 h-4 text-pink-500" /> 1080p HD Video
              </span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-100">~{hdVideoHours} hours</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Film className="w-4 h-4 text-pink-500" /> 4K Ultra HD Video
              </span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-100">~{uhd4kHours} hours</span>
            </div>
          </div>
        </div>

        {/* Transfer Speeds */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Estimated Download Time
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Wifi className="w-4 h-4 text-cyan-500" /> 100 Mbps Broadband
              </span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-100">
                {formatDuration(downloadSecondsAt100Mbps)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Wifi className="w-4 h-4 text-emerald-500" /> 1 Gbps Gigabit Fiber
              </span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-100">
                {formatDuration(downloadSecondsAt1Gbps)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
