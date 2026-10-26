import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/FormElements';
import { CopyButton } from '../../components/ui/Cards';
import { generateUUID } from '../../utils/file';

export function UUIDGenerator() {
  const [uuids, setUuids] = React.useState<string[]>([generateUUID()]);
  const [count, setCount] = React.useState(1);

  const generate = () => {
    const newUuids = Array.from({ length: Math.min(count, 50) }, () => generateUUID());
    setUuids(newUuids);
  };

  const allText = uuids.join('\n');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="uuid-count" className="text-sm font-medium text-gray-700 block mb-1.5">
            How many UUIDs? (1–50)
          </label>
          <input
            id="uuid-count"
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-28 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <Button onClick={generate}>
          <RefreshCw className="size-4" /> Generate
        </Button>
        {uuids.length > 0 && <CopyButton text={allText} />}
      </div>

      <div className="space-y-2">
        {uuids.map((uuid, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
            <span className="text-xs text-gray-400 w-5 shrink-0 text-right">{i + 1}</span>
            <code className="flex-1 text-sm font-mono text-gray-800 select-all">{uuid}</code>
            <CopyButton text={uuid} />
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Generated using <code>crypto.randomUUID()</code> — cryptographically secure UUID v4.
      </p>
    </div>
  );
}
