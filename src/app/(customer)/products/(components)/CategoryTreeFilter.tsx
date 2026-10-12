"use client";

import { useState, useEffect } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { CategoryItem } from "@/src/services/customer/categoriesService";

interface Props {
  activeCategoryTree: CategoryItem[];
  selectedCategoryIds: string[];
  loading: boolean;
  onCategoryToggle: (categoryId: string) => void;
}

export default function CategoryTreeFilter({
  activeCategoryTree,
  selectedCategoryIds,
  loading,
  onCategoryToggle,
}: Props) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeCategoryTree.length > 0) {
      const initial: Record<string, boolean> = {};
      activeCategoryTree.forEach((cat) => {
        initial[cat.id] = true;
      });
      setOpenSections(initial);
    }
  }, [activeCategoryTree]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
        Danh mục sản phẩm
      </h4>

      {loading ? (
        <div className="py-4 text-center text-xs text-slate-400 font-medium">
          Đang tải danh mục...
        </div>
      ) : activeCategoryTree.length === 0 ? (
        <div className="py-2 text-xs text-slate-400 font-medium">
          Chưa có danh mục nào.
        </div>
      ) : (
        <div className="space-y-3.5">
          {activeCategoryTree.map((l1) => {
            const isL1Open = openSections[l1.id] ?? true;
            const hasChildren = l1.children && l1.children.length > 0;

            return (
              <div
                key={l1.id}
                className="border-b border-slate-100 last:border-none pb-3.5 last:pb-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800 hover:text-[#0d5c3a] transition">
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(l1.id)}
                      onChange={() => onCategoryToggle(l1.id)}
                      className="w-3.5 h-3.5 text-[#0d5c3a] rounded border-slate-300 focus:ring-[#0d5c3a] cursor-pointer"
                    />
                    <span className="truncate">{l1.name}</span>
                  </label>

                  {hasChildren && (
                    <button
                      type="button"
                      onClick={() => toggleSection(l1.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
                    >
                      {isL1Open ? (
                        <ChevronUpIcon className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDownIcon className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {hasChildren && isL1Open && (
                  <div className="ml-3.5 border-l-2 border-slate-100 pl-3 pt-1">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                      {l1.children?.map((l2) => {
                        const l3List = l2.children || [];

                        return (
                          <div key={l2.id} className="space-y-1.5 min-w-0">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800 hover:text-[#0d5c3a] transition">
                              <input
                                type="checkbox"
                                checked={selectedCategoryIds.includes(l2.id)}
                                onChange={() => onCategoryToggle(l2.id)}
                                className="w-3.5 h-3.5 text-[#0d5c3a] rounded border-slate-300 focus:ring-[#0d5c3a] cursor-pointer shrink-0"
                              />
                              <span className="truncate" title={l2.name}>
                                {l2.name}
                              </span>
                            </label>

                            {l3List.length > 0 && (
                              <div className="pl-2 space-y-1">
                                {l3List.map((l3) => (
                                  <label
                                    key={l3.id}
                                    className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-500 hover:text-slate-900 transition"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedCategoryIds.includes(
                                        l3.id,
                                      )}
                                      onChange={() => onCategoryToggle(l3.id)}
                                      className="w-3 h-3 text-[#0d5c3a] rounded border-slate-300 focus:ring-[#0d5c3a] cursor-pointer shrink-0"
                                    />
                                    <span className="truncate" title={l3.name}>
                                      {l3.name}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
