"use client";

import { useToast } from "@/components/Toast";
import { useUpdateCategory } from "@/hooks";
import { Category } from "@/types/cardapio-api";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useState } from "react";

interface CategoryDragDropProps {
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
}

// Componente para item arrastável
function SortableCategoryItem({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center justify-between p-4 border rounded-lg cursor-move
        ${
          isDragging
            ? "bg-blue-50 border-blue-200 shadow-lg"
            : "bg-white border-gray-200"
        }
        ${!category.active ? "opacity-60" : ""}
      `}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {index + 1}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {category.image && (
            <img
              src={category.image}
              alt={category.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-900">
              {category.name}
            </h4>
            {category.description && (
              <p className="text-xs text-gray-500">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            category.active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {category.active ? "Ativa" : "Inativa"}
        </span>

        <div className="text-xs text-gray-400">Ordem: {category.order}</div>
      </div>
    </div>
  );
}

export function CategoryDragDrop({
  categories,
  onCategoriesChange,
}: CategoryDragDropProps) {
  const [localCategories, setLocalCategories] =
    useState<Category[]>(categories);
  const updateCategoryMutation = useUpdateCategory();
  const { success, error: showError } = useToast();

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Atualizar categorias locais quando as props mudarem
  useState(() => {
    setLocalCategories(categories);
  });

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = localCategories.findIndex(
          (cat) => cat.id === active.id
        );
        const newIndex = localCategories.findIndex(
          (cat) => cat.id === over?.id
        );

        if (oldIndex !== -1 && newIndex !== -1) {
          const newCategories = arrayMove(localCategories, oldIndex, newIndex);

          // Atualizar ordem das categorias
          const updatedCategories = newCategories.map((category, index) => ({
            ...category,
            order: index,
          }));

          setLocalCategories(updatedCategories);
          onCategoriesChange(updatedCategories);

          // Salvar nova ordem no backend
          try {
            await updateCategoryMutation.mutateAsync({
              id: active.id as string,
              categoryData: { order: newIndex },
            });

            success("Ordem das categorias atualizada com sucesso!");
          } catch (error: any) {
            showError("Erro ao atualizar ordem das categorias");
            // Reverter mudanças em caso de erro
            setLocalCategories(categories);
            onCategoriesChange(categories);
          }
        }
      }
    },
    [
      localCategories,
      onCategoriesChange,
      updateCategoryMutation,
      success,
      showError,
      categories,
    ]
  );

  if (localCategories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma categoria para reordenar
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Reordenar Categorias
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Arraste e solte as categorias para alterar a ordem de exibição
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localCategories.map((cat) => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {localCategories.map((category, index) => (
              <SortableCategoryItem
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-sm text-blue-700">
            <p className="font-medium">Dica:</p>
            <p>
              A ordem das categorias afeta como elas aparecem no cardápio
              público. Categorias com menor número de ordem aparecem primeiro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
