import React from "react";
import type { Artwork } from '../types';


interface Props {
  selectedMap: Record<number, Artwork>;
  clearSelection: () => void;
}

export const SelectionPanel: React.FC<Props> = ({ selectedMap, clearSelection }) => (
  <div className="border p-3 rounded mb-3 bg-white shadow-sm">
    <div className="flex justify-between items-center">
      <div><strong>Selected:</strong> {Object.keys(selectedMap).length}</div>
      <button className="px-3 py-1 border rounded bg-red-500 text-white" onClick={clearSelection}>Clear</button>
    </div>
    {Object.keys(selectedMap).length > 0 && (
      <ul className="mt-2 max-h-32 overflow-auto pl-5 list-disc">
        {Object.values(selectedMap).map(a => <li key={a.id}>{a.title}</li>)}
      </ul>
    )}
  </div>
);
