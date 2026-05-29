'use client';

import { useRef, useState } from 'react';

function InlineEdit({
  initialValue,
  onSave,
  onCancel,
}: {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (value.trim()) {
      onSave(value.trim());
    } else {
      onCancel();
    }
  };

  return (
    <div className='flex items-center gap-2 px-3 py-2'>
      <input
        ref={inputRef}
        type='text'
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') onCancel();
        }}
        onBlur={handleSave}
        autoFocus
        maxLength={20}
        className='flex-1 px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:border-purple-500'
      />
    </div>
  );
}

export default InlineEdit;
