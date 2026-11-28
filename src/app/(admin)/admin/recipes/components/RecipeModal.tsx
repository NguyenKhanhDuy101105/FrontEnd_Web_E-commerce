"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  RecipeItem,
  RecipePayload,
  RecipeIngredient,
  CategoryMonAn,
  adminRecipeService,
} from "@/src/services/admin/adminRecipeService";
import { showToast } from "@/src/utils/toast";
import ProductSearchSelect from "./ProductSearchSelect";

interface RecipeModalProps {
  isOpen: boolean;
  editingRecipe: RecipeItem | null;
  existingRecipes?: RecipeItem[];
  onClose: () => void;
  onSubmit: (payload: RecipePayload) => Promise<void>;
}

interface RecipeFormContentProps {
  editingRecipe: RecipeItem | null;
  existingRecipes?: RecipeItem[];
  onClose: () => void;
  onSubmit: (payload: RecipePayload) => Promise<void>;
}

const MAX_RECIPE_NAME_LENGTH = 150;
const MAX_IMAGE_URL_LENGTH = 500;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_INGREDIENTS_PER_RECIPE = 20;
const MIN_INGREDIENT_QUANTITY = 1;
const MAX_INGREDIENT_QUANTITY = 5;

const NON_IMAGE_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
  ".zip",
  ".rar",
  ".7z",
  ".exe",
  ".mp4",
  ".mp3",
  ".avi",
  ".mov",
  ".json",
  ".xml",
  ".html",
  ".htm",
  ".php",
  ".js",
  ".css",
];

const HTML_TAG_OR_SCRIPT_REGEX =
  /<\s*\/?\s*[a-zA-Z][^>]*>|javascript\s*:|on\w+\s*=/i;

const normalizeRecipeName = (value: string): string =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

const cleanSpaces = (value: string): string =>
  value.trim().replace(/\s+/g, " ");

const validateImageUrlFormat = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return "Vui lòng nhập URL hình ảnh món ăn.";
  }

  if (trimmed.length > MAX_IMAGE_URL_LENGTH) {
    return `URL hình ảnh không được vượt quá ${MAX_IMAGE_URL_LENGTH} ký tự.`;
  }

  if (/\s/.test(trimmed)) {
    return "Định dạng URL hình ảnh không hợp lệ.";
  }

  if (/^javascript\s*:/i.test(trimmed)) {
    return "URL hình ảnh phải bắt đầu bằng http:// hoặc https://.";
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "Định dạng URL hình ảnh không hợp lệ.";
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "URL hình ảnh phải bắt đầu bằng http:// hoặc https://.";
  }

  if (!parsed.hostname || !parsed.hostname.includes(".")) {
    return "Định dạng URL hình ảnh không hợp lệ.";
  }

  const lowerPath = parsed.pathname.toLowerCase();
  const hasNonImageExt = NON_IMAGE_EXTENSIONS.some((ext) =>
    lowerPath.endsWith(ext),
  );
  if (hasNonImageExt) {
    return "URL không phải là định dạng hình ảnh hợp lệ.";
  }

  return "";
};

const verifyImageLoadable = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    let settled = false;

    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(ok);
    };

    const timer = setTimeout(() => finish(false), 6000);

    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = url;
  });
};

function RecipeFormContent({
  editingRecipe,
  existingRecipes = [],
  onClose,
  onSubmit,
}: RecipeFormContentProps) {
  const [name, setName] = useState(
    (editingRecipe?.name || "").slice(0, MAX_RECIPE_NAME_LENGTH),
  );
  const [description, setDescription] = useState(
    editingRecipe?.description || "",
  );
  const [imageUrl, setImageUrl] = useState(editingRecipe?.imageUrl || "");
  const [categoryMonAn, setCategoryMonAn] = useState<CategoryMonAn>(
    editingRecipe?.categoryMonAn || "VEGETABLE",
  );
  const [isActive, setIsActive] = useState<boolean>(
    editingRecipe?.isActive ?? true,
  );
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    editingRecipe?.ingredients || [],
  );
  const [ingredientWarning, setIngredientWarning] = useState<string>("");

  const [checkingDuplicateName, setCheckingDuplicateName] = useState(false);
  const [isDuplicateNameOnServer, setIsDuplicateNameOnServer] = useState(false);

  const [checkingImageUrl, setCheckingImageUrl] = useState(false);
  const [isImageBroken, setIsImageBroken] = useState(false);

  const [loadingRecipe, setLoadingRecipe] = useState<boolean>(
    Boolean(
      editingRecipe?.id &&
      (!editingRecipe.ingredients || editingRecipe.ingredients.length === 0),
    ),
  );
  const [submitting, setSubmitting] = useState(false);
  const [submittedAttempt, setSubmittedAttempt] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    imageUrl: false,
    description: false,
  });

  useEffect(() => {
    const recipeId = editingRecipe?.id;
    const hasIngredients =
      editingRecipe?.ingredients && editingRecipe.ingredients.length > 0;

    if (!recipeId || hasIngredients) return;

    let isMounted = true;

    adminRecipeService
      .getRecipeById(recipeId)
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data || res;
        if (data) {
          setName(
            (data.name || editingRecipe.name || "").slice(
              0,
              MAX_RECIPE_NAME_LENGTH,
            ),
          );
          setDescription(data.description || editingRecipe.description || "");
          setImageUrl(data.imageUrl || editingRecipe.imageUrl || "");
          setCategoryMonAn(
            data.categoryMonAn || editingRecipe.categoryMonAn || "VEGETABLE",
          );
          setIsActive(data.isActive ?? true);
          setIngredients(data.ingredients || []);
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy chi tiết công thức:", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingRecipe(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [editingRecipe]);

  const isDuplicateNameLocal = useMemo(() => {
    const normalizedInput = normalizeRecipeName(name);
    if (normalizedInput.length < 2) return false;

    return existingRecipes.some(
      (item) =>
        item.id !== editingRecipe?.id &&
        normalizeRecipeName(item.name || "") === normalizedInput,
    );
  }, [name, existingRecipes, editingRecipe?.id]);

  useEffect(() => {
    const cleanedSearchKeyword = cleanSpaces(name);
    const normalizedInput = normalizeRecipeName(name);

    if (
      normalizedInput.length < 2 ||
      isDuplicateNameLocal ||
      HTML_TAG_OR_SCRIPT_REGEX.test(cleanedSearchKeyword)
    ) {
      setIsDuplicateNameOnServer(false);
      setCheckingDuplicateName(false);
      return;
    }

    let isMounted = true;
    setCheckingDuplicateName(true);

    const timer = setTimeout(() => {
      adminRecipeService
        .getRecipes({
          keyword: cleanedSearchKeyword,
          page: 0,
          size: 50,
        })
        .then((res) => {
          if (!isMounted) return;
          const items = res?.data?.content || [];
          const hasMatch = items.some(
            (item) =>
              item.id !== editingRecipe?.id &&
              normalizeRecipeName(item.name || "") === normalizedInput,
          );
          setIsDuplicateNameOnServer(hasMatch);
        })
        .catch(() => {
          if (isMounted) {
            setIsDuplicateNameOnServer(false);
          }
        })
        .finally(() => {
          if (isMounted) {
            setCheckingDuplicateName(false);
          }
        });
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [name, editingRecipe?.id, isDuplicateNameLocal]);

  useEffect(() => {
    const trimmedUrl = imageUrl.trim();
    const formatErr = validateImageUrlFormat(trimmedUrl);

    if (formatErr) {
      setIsImageBroken(false);
      setCheckingImageUrl(false);
      return;
    }

    let isMounted = true;
    setCheckingImageUrl(true);
    setIsImageBroken(false);

    const timer = setTimeout(() => {
      verifyImageLoadable(trimmedUrl).then((ok) => {
        if (!isMounted) return;
        setIsImageBroken(!ok);
        setCheckingImageUrl(false);
      });
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [imageUrl]);

  const errors = useMemo(() => {
    const trimmedName = cleanSpaces(name);
    const trimmedImageUrl = imageUrl.trim();
    const trimmedDescription = description.trim();

    let nameErr = "";
    if (!trimmedName) {
      nameErr = "Vui lòng nhập tên món ăn.";
    } else if (HTML_TAG_OR_SCRIPT_REGEX.test(trimmedName)) {
      nameErr = "Tên món ăn không được chứa thẻ HTML hoặc mã script.";
    } else if (trimmedName.length < 2) {
      nameErr = "Tên món ăn phải có ít nhất 2 ký tự.";
    } else if (trimmedName.length > MAX_RECIPE_NAME_LENGTH) {
      nameErr = `Tên món ăn không được vượt quá ${MAX_RECIPE_NAME_LENGTH} ký tự.`;
    } else if (isDuplicateNameLocal || isDuplicateNameOnServer) {
      nameErr = "Tên món ăn này đã tồn tại trên hệ thống.";
    }

    let imageUrlErr = validateImageUrlFormat(trimmedImageUrl);
    if (!imageUrlErr && isImageBroken) {
      imageUrlErr =
        "Không thể tải hình ảnh từ URL này (ảnh không tồn tại hoặc bị lỗi).";
    }

    let descriptionErr = "";
    if (!trimmedDescription) {
      descriptionErr = "Vui lòng nhập mô tả ngắn cho món ăn.";
    } else if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
      descriptionErr = `Mô tả ngắn không được vượt quá ${MAX_DESCRIPTION_LENGTH} ký tự.`;
    } else if (HTML_TAG_OR_SCRIPT_REGEX.test(trimmedDescription)) {
      descriptionErr = "Mô tả không được chứa thẻ HTML hoặc mã script.";
    }

    let ingredientsErr = "";
    if (ingredients.length === 0) {
      ingredientsErr = "Vui lòng thêm ít nhất 1 thành phần nguyên liệu.";
    } else if (ingredients.length > MAX_INGREDIENTS_PER_RECIPE) {
      ingredientsErr = `Một công thức chỉ được tối đa ${MAX_INGREDIENTS_PER_RECIPE} sản phẩm.`;
    } else {
      const hasMissingField = ingredients.some(
        (ing) => !ing.productId || !ing.productId.trim() || !ing.group,
      );
      const hasInvalidQuantity = ingredients.some(
        (ing) =>
          !Number.isInteger(ing.quantity) ||
          ing.quantity < MIN_INGREDIENT_QUANTITY ||
          ing.quantity > MAX_INGREDIENT_QUANTITY,
      );

      if (hasMissingField) {
        ingredientsErr =
          "Vui lòng chọn đầy đủ sản phẩm và nhóm cho tất cả nguyên liệu.";
      } else if (hasInvalidQuantity) {
        ingredientsErr = `Số lượng mỗi sản phẩm phải từ ${MIN_INGREDIENT_QUANTITY} đến ${MAX_INGREDIENT_QUANTITY}.`;
      } else {
        const productIds = ingredients.map((ing) => ing.productId.trim());
        const hasDuplicateProduct =
          new Set(productIds).size !== productIds.length;
        if (hasDuplicateProduct) {
          ingredientsErr =
            "Không được chọn trùng sản phẩm trong cùng một công thức.";
        }
      }
    }

    return {
      name: nameErr,
      imageUrl: imageUrlErr,
      description: descriptionErr,
      ingredients: ingredientsErr,
    };
  }, [
    name,
    imageUrl,
    description,
    ingredients,
    isDuplicateNameLocal,
    isDuplicateNameOnServer,
    isImageBroken,
  ]);

  const isFormValid =
    !errors.name &&
    !errors.imageUrl &&
    !errors.description &&
    !errors.ingredients &&
    Boolean(categoryMonAn);

  const handleAddIngredient = () => {
    if (ingredients.length >= MAX_INGREDIENTS_PER_RECIPE) {
      const warningMsg = `Một công thức chỉ được tối đa ${MAX_INGREDIENTS_PER_RECIPE} sản phẩm.`;
      setIngredientWarning(warningMsg);
      showToast.warning(warningMsg);
      return;
    }

    setIngredientWarning("");
    setIngredients([
      ...ingredients,
      {
        productId: "",
        quantity: MIN_INGREDIENT_QUANTITY,
        isRequired: true,
        group: "MAIN",
        note: "",
      },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredientWarning("");
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = <K extends keyof RecipeIngredient>(
    index: number,
    field: K,
    value: RecipeIngredient[K],
  ) => {
    if (field === "productId") {
      const nextProductId = String(value || "").trim();

      if (nextProductId) {
        const isDuplicate = ingredients.some(
          (item, idx) =>
            idx !== index && item.productId?.trim() === nextProductId,
        );

        if (isDuplicate) {
          const warningMsg =
            "Sản phẩm này đã được chọn trong công thức. Vui lòng chọn sản phẩm khác!";
          setIngredientWarning(warningMsg);
          showToast.warning(warningMsg);
          return;
        }
      }

      setIngredientWarning("");
    }

    if (field === "quantity") {
      const rawQty = Number(value);
      if (Number.isNaN(rawQty)) {
        return;
      }

      if (
        rawQty < MIN_INGREDIENT_QUANTITY ||
        rawQty > MAX_INGREDIENT_QUANTITY
      ) {
        setIngredientWarning(
          `Số lượng mỗi sản phẩm chỉ được phép từ ${MIN_INGREDIENT_QUANTITY} đến ${MAX_INGREDIENT_QUANTITY}.`,
        );
      } else {
        setIngredientWarning("");
      }

      const updated = [...ingredients];
      updated[index] = {
        ...updated[index],
        quantity: Math.trunc(rawQty),
      };
      setIngredients(updated);
      return;
    }

    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedName = cleanSpaces(name);
    const cleanedImageUrl = imageUrl.trim();
    const cleanedDescription = description.trim();

    setName(cleanedName);
    setImageUrl(cleanedImageUrl);
    setDescription(cleanedDescription);
    setSubmittedAttempt(true);
    setTouched({ name: true, imageUrl: true, description: true });

    if (!isFormValid || submitting || checkingDuplicateName) return;

    const normalizedInput = normalizeRecipeName(cleanedName);

    try {
      setSubmitting(true);

      const isImageOk = await verifyImageLoadable(cleanedImageUrl);
      if (!isImageOk) {
        setIsImageBroken(true);
        return;
      }

      const checkRes = await adminRecipeService.getRecipes({
        keyword: cleanedName,
        page: 0,
        size: 50,
      });
      const existingItems = checkRes?.data?.content || [];
      const isDuplicate = existingItems.some(
        (item) =>
          item.id !== editingRecipe?.id &&
          normalizeRecipeName(item.name || "") === normalizedInput,
      );

      if (isDuplicate) {
        setIsDuplicateNameOnServer(true);
        showToast.warning("Tên món ăn này đã tồn tại trên hệ thống!");
        return;
      }

      await onSubmit({
        name: cleanedName,
        description: cleanedDescription,
        imageUrl: cleanedImageUrl,
        categoryMonAn,
        isActive,
        ingredients: ingredients.map((ing) => ({
          ...ing,
          productId: ing.productId.trim(),
          quantity: Number(ing.quantity),
        })),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const isDuplicateError = isDuplicateNameLocal || isDuplicateNameOnServer;
  const isImageUrlOverLimit = imageUrl.trim().length > MAX_IMAGE_URL_LENGTH;
  const isDescriptionOverLimit =
    description.trim().length > MAX_DESCRIPTION_LENGTH;

  const showNameError =
    (touched.name || submittedAttempt || isDuplicateError) &&
    Boolean(errors.name);
  const showImageUrlError =
    (touched.imageUrl ||
      submittedAttempt ||
      isImageUrlOverLimit ||
      isImageBroken) &&
    Boolean(errors.imageUrl);
  const showDescriptionError =
    (touched.description || submittedAttempt || isDescriptionOverLimit) &&
    Boolean(errors.description);
  const ingredientsErrorMessage =
    ingredientWarning || (submittedAttempt ? errors.ingredients : "");
  const isAtMaxIngredients = ingredients.length >= MAX_INGREDIENTS_PER_RECIPE;

  return (
    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-800">
          {editingRecipe ? "Chỉnh sửa công thức" : "Tạo công thức món ăn mới"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer disabled:opacity-50"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {loadingRecipe ? (
        <div className="py-12 text-center text-sm text-slate-400 animate-pulse">
          Đang tải thông tin công thức và nguyên liệu...
        </div>
      ) : (
        <form onSubmit={handleSubmitForm} noValidate className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Tên món ăn <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-[11px] font-medium ${
                  name.length >= MAX_RECIPE_NAME_LENGTH
                    ? "text-amber-600"
                    : "text-slate-400"
                }`}
              >
                {name.length}/{MAX_RECIPE_NAME_LENGTH}
              </span>
            </div>
            <input
              type="text"
              maxLength={MAX_RECIPE_NAME_LENGTH}
              value={name}
              onBlur={() => {
                setName((prev) => cleanSpaces(prev));
                setTouched((prev) => ({ ...prev, name: true }));
              }}
              onChange={(e) => {
                setIsDuplicateNameOnServer(false);
                setName(e.target.value.slice(0, MAX_RECIPE_NAME_LENGTH));
              }}
              placeholder="VD: Canh chua cá lóc"
              className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none transition-colors ${
                showNameError
                  ? "border-rose-400 bg-rose-50/40 focus:border-rose-500"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {showNameError && (
              <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Danh mục món ăn <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryMonAn}
                onChange={(e) =>
                  setCategoryMonAn(e.target.value as CategoryMonAn)
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:outline-none bg-white"
              >
                <option value="VEGETABLE">Món rau</option>
                <option value="MEAT">Món thịt</option>
                <option value="SEAFOOD">Hải sản</option>
                <option value="SOUP">Món canh</option>
                <option value="HOTPOT">Món lẩu</option>
                <option value="VEGETARIAN">Món chay</option>
                <option value="DESSERT">Tráng miệng</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng thái <span className="text-rose-500">*</span>
              </label>
              <select
                value={isActive ? "true" : "false"}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:outline-none bg-white"
              >
                <option value="true">Hiển thị (Active)</option>
                <option value="false">Ẩn (Inactive)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                URL hình ảnh <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-[11px] font-medium ${
                  isImageUrlOverLimit ? "text-rose-600" : "text-slate-400"
                }`}
              >
                {imageUrl.trim().length}/{MAX_IMAGE_URL_LENGTH}
              </span>
            </div>
            <input
              type="url"
              value={imageUrl}
              onBlur={() => {
                setImageUrl((prev) => prev.trim());
                setTouched((prev) => ({ ...prev, imageUrl: true }));
              }}
              onChange={(e) => {
                setIsImageBroken(false);
                setImageUrl(e.target.value);
              }}
              placeholder="https://example.com/image.jpg"
              className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none transition-colors ${
                showImageUrlError
                  ? "border-rose-400 bg-rose-50/40 focus:border-rose-500"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {showImageUrlError && (
              <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.imageUrl}</span>
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Mô tả ngắn <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-[11px] font-medium ${
                  isDescriptionOverLimit ? "text-rose-600" : "text-slate-400"
                }`}
              >
                {description.trim().length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onBlur={() => {
                setDescription((prev) => prev.trim());
                setTouched((prev) => ({ ...prev, description: true }));
              }}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hướng dẫn nấu sơ lược hoặc mô tả món ăn..."
              className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none transition-colors ${
                showDescriptionError
                  ? "border-rose-400 bg-rose-50/40 focus:border-rose-500"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {showDescriptionError && (
              <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-700">
                  Thành phần nguyên liệu{" "}
                  <span className="text-rose-500">*</span>
                </h4>
                <span className="text-[11px] font-medium text-slate-400">
                  ({ingredients.length}/{MAX_INGREDIENTS_PER_RECIPE})
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddIngredient}
                disabled={isAtMaxIngredients}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" /> Thêm nguyên liệu
              </button>
            </div>

            {ingredients.length === 0 ? (
              <div
                className={`p-4 text-center text-xs rounded-xl border border-dashed ${
                  ingredientsErrorMessage
                    ? "text-rose-600 bg-rose-50/40 border-rose-300"
                    : "text-slate-400 bg-slate-50 border-slate-200"
                }`}
              >
                Chưa có nguyên liệu nào. Bấm &ldquo;Thêm nguyên liệu&rdquo; để
                bổ sung.
              </div>
            ) : (
              ingredients.map((ing, idx) => {
                const isDuplicateRow =
                  Boolean(ing.productId?.trim()) &&
                  ingredients.filter(
                    (other) =>
                      other.productId?.trim() === ing.productId?.trim(),
                  ).length > 1;

                const isQuantityInvalid =
                  !Number.isInteger(ing.quantity) ||
                  ing.quantity < MIN_INGREDIENT_QUANTITY ||
                  ing.quantity > MAX_INGREDIENT_QUANTITY;

                const isRowInvalid =
                  isDuplicateRow ||
                  isQuantityInvalid ||
                  (submittedAttempt && (!ing.productId?.trim() || !ing.group));

                return (
                  <div
                    key={idx}
                    className={`flex flex-wrap sm:flex-nowrap items-center gap-2 p-2.5 rounded-xl border text-xs ${
                      isRowInvalid
                        ? "bg-rose-50/40 border-rose-300"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <ProductSearchSelect
                      value={ing.productId}
                      onChange={(productId) =>
                        handleIngredientChange(idx, "productId", productId)
                      }
                    />

                    <input
                      type="number"
                      min={MIN_INGREDIENT_QUANTITY}
                      max={MAX_INGREDIENT_QUANTITY}
                      step={1}
                      placeholder="SL"
                      value={ing.quantity}
                      onChange={(e) =>
                        handleIngredientChange(
                          idx,
                          "quantity",
                          Number(e.target.value),
                        )
                      }
                      className={`w-16 px-2.5 py-1.5 rounded-lg border bg-white focus:outline-none ${
                        isQuantityInvalid
                          ? "border-rose-400 text-rose-600"
                          : "border-slate-200"
                      }`}
                    />

                    <select
                      value={ing.group}
                      onChange={(e) =>
                        handleIngredientChange(
                          idx,
                          "group",
                          e.target.value as RecipeIngredient["group"],
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="MAIN">Chính</option>
                      <option value="SUB">Phụ</option>
                      <option value="SPICE">Gia vị</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}

            {ingredientsErrorMessage && (
              <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600">
                <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{ingredientsErrorMessage}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || checkingDuplicateName || checkingImageUrl}
              className="px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting
                ? "Đang lưu..."
                : editingRecipe
                  ? "Cập nhật"
                  : "Tạo mới"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function RecipeModal({
  isOpen,
  editingRecipe,
  existingRecipes,
  onClose,
  onSubmit,
}: RecipeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <RecipeFormContent
        key={`${editingRecipe?.id || "create"}-${isOpen}`}
        editingRecipe={editingRecipe}
        existingRecipes={existingRecipes}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </div>
  );
}
