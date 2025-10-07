"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProductTagsSectionProps {
  tags: string[];
  newTag: string;
  onNewTagChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tagToRemove: string) => void;
}

export function ProductTagsSection({
  tags,
  newTag,
  onNewTagChange,
  onAddTag,
  onRemoveTag,
}: ProductTagsSectionProps) {
  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900">Tags</h3>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              className="ml-1 text-blue-600 hover:text-blue-800"
              aria-label={`Remover tag ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => onNewTagChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddTag();
            }
          }}
          placeholder="Adicionar tag"
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          type="button"
          onClick={onAddTag}
          disabled={!newTag.trim()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}