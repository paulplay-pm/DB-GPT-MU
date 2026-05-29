'use client';

import { ReactNode, createContext, useContext, useState } from 'react';

interface DnDContextValue {
  draggingConvUid: string | null;
  draggingOverCategoryId: number | null;
  setDraggingConvUid: (uid: string | null) => void;
  setDraggingOverCategoryId: (id: number | null) => void;
}

const DnDContext = createContext<DnDContextValue>({
  draggingConvUid: null,
  draggingOverCategoryId: null,
  setDraggingConvUid: () => {},
  setDraggingOverCategoryId: () => {},
});

export function DnDProvider({ children }: { children: ReactNode }) {
  const [draggingConvUid, setDraggingConvUid] = useState<string | null>(null);
  const [draggingOverCategoryId, setDraggingOverCategoryId] = useState<number | null>(null);

  return (
    <DnDContext.Provider
      value={{
        draggingConvUid,
        draggingOverCategoryId,
        setDraggingConvUid,
        setDraggingOverCategoryId,
      }}
    >
      {children}
    </DnDContext.Provider>
  );
}

export function useDnD() {
  return useContext(DnDContext);
}

export default DnDContext;
