"use client";

import { useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  IndianRupee,
  Check,
  Loader2,
  Tag,
} from "lucide-react";
import { paiseToRupees, rupeesToPaise } from "@sriambika/db";
import { supabaseBrowser } from "@/lib/supabase";
import Toggle from "./Toggle";
import type { MenuRow, CategoryItem } from "./types";

export default function MenuPanel({
  menu,
  setMenu,
  categories,
  setCategories,
}: {
  menu: MenuRow[];
  setMenu: React.Dispatch<React.SetStateAction<MenuRow[]>>;
  categories: CategoryItem[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const catNames = categories.map((c) => c.id);

  const patch = (id: string, p: Partial<MenuRow>) =>
    setMenu((prev) => prev.map((m) => (m.id === id ? { ...m, ...p } : m)));

  const SESSION_MSG =
    "Couldn't save — your session may have expired. Please sign out and back in.";

  const toggle = async (m: MenuRow) => {
    const sb = supabaseBrowser();
    if (!sb) return;
    patch(m.id, { available: !m.available });
    const { data, error } = await sb
      .from("menu_items")
      .update({ available: !m.available })
      .eq("id", m.id)
      .select("id");
    if (error || !data?.length) {
      patch(m.id, { available: m.available });
      setError(error?.message ?? SESSION_MSG);
    }
  };

  const savePrice = async (m: MenuRow, rupees: number) => {
    const sb = supabaseBrowser();
    if (!sb) return;
    const price_paise = rupeesToPaise(rupees);
    const old = m.price_paise;
    patch(m.id, { price_paise });
    const { data, error } = await sb
      .from("menu_items")
      .update({ price_paise })
      .eq("id", m.id)
      .select("id");
    if (error || !data?.length) {
      patch(m.id, { price_paise: old });
      setError(error?.message ?? SESSION_MSG);
    }
  };

  const saveCategory = async (m: MenuRow, category_id: string) => {
    const sb = supabaseBrowser();
    if (!sb) return;
    const old = m.category_id;
    patch(m.id, { category_id });
    const { data, error } = await sb
      .from("menu_items")
      .update({ category_id })
      .eq("id", m.id)
      .select("id");
    if (error || !data?.length) {
      patch(m.id, { category_id: old });
      setError(error?.message ?? SESSION_MSG);
    }
  };

  const remove = async (m: MenuRow) => {
    if (!confirm(`Remove "${m.name}" from the menu?`)) return;
    const sb = supabaseBrowser();
    if (!sb) return;
    const prev = menu;
    setMenu((p) => p.filter((x) => x.id !== m.id));
    const { error } = await sb.from("menu_items").delete().eq("id", m.id);
    if (error) { setMenu(prev); setError(error.message); }
  };

  const uploadImage = async (m: MenuRow, file: File) => {
    const sb = supabaseBrowser();
    if (!sb) return;
    setError(null);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${m.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await sb.storage
      .from("menu-images")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setError(upErr.message); return; }
    const { data } = sb.storage.from("menu-images").getPublicUrl(path);
    patch(m.id, { image_url: data.publicUrl });
    await sb.from("menu_items").update({ image_url: data.publicUrl }).eq("id", m.id);
  };

  return (
    <div>
      <CategoryManager
        categories={categories}
        setCategories={setCategories}
        onError={setError}
      />

      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ivory">Menu items</h2>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-2 rounded-xl clay px-4 py-2.5 font-body text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> Add item
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-terracotta/15 px-4 py-3 font-body text-sm text-terracotta">
          {error}
        </p>
      )}

      {showAdd && (
        <AddItem setMenu={setMenu} categories={catNames} onDone={() => setShowAdd(false)} onError={setError} />
      )}

      <div className="space-y-4">
        {menu.map((m) => (
          <ItemRow
            key={m.id}
            item={m}
            categories={catNames}
            onToggle={() => toggle(m)}
            onPrice={(r) => savePrice(m, r)}
            onCategory={(c) => saveCategory(m, c)}
            onRemove={() => remove(m)}
            onUpload={(f) => uploadImage(m, f)}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryManager({
  categories,
  setCategories,
  onError,
}: {
  categories: CategoryItem[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
  onError: (m: string) => void;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const add = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2 || busy) return;
    if (categories.some((c) => c.id.toLowerCase() === trimmed.toLowerCase())) {
      onError(`Category "${trimmed}" already exists.`);
      return;
    }
    const sb = supabaseBrowser();
    if (!sb) return;
    setBusy(true);
    const sort = categories.length + 1;
    const { data, error } = await sb
      .from("categories")
      .insert({ id: trimmed, name: trimmed, sort })
      .select("*")
      .single();
    setBusy(false);
    if (error) { onError(error.message); return; }
    setCategories((p) => [...p, data as CategoryItem]);
    setName("");
  };

  const remove = async (c: CategoryItem) => {
    if (!confirm(`Delete category "${c.name}"? Items in it become uncategorised.`)) return;
    const sb = supabaseBrowser();
    if (!sb) return;
    const prev = categories;
    setCategories((p) => p.filter((x) => x.id !== c.id));
    const { error } = await sb.from("categories").delete().eq("id", c.id);
    if (error) { setCategories(prev); onError(error.message); }
  };

  return (
    <div className="mb-6 rounded-2xl glass p-5">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-amber" />
        <h3 className="font-display text-lg font-bold text-ivory">Categories</h3>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {categories.map((c) => (
          <span
            key={c.id}
            className="flex items-center gap-1.5 rounded-full neu px-3 py-1.5 font-body text-sm text-ivory/80"
          >
            {c.name}
            <button
              onClick={() => remove(c)}
              className="text-ivory/40 transition-colors hover:text-terracotta"
              aria-label={`Delete ${c.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="New category (e.g. Sweets)"
          className="flex-1 rounded-xl neu-inset px-4 py-2.5 font-body text-sm text-ivory placeholder:text-ivory/30 focus:outline-none focus:ring-2 focus:ring-amber/50"
        />
        <button
          onClick={add}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-xl clay-gold px-4 py-2.5 font-body text-sm font-bold text-espresso-900 transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </div>
  );
}

function ItemRow({
  item,
  categories,
  onToggle,
  onPrice,
  onCategory,
  onRemove,
  onUpload,
}: {
  item: MenuRow;
  categories: string[];
  onToggle: () => void;
  onPrice: (rupees: number) => void;
  onCategory: (c: string) => void;
  onRemove: () => void;
  onUpload: (file: File) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [price, setPrice] = useState(String(paiseToRupees(item.price_paise)));

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    await onUpload(f);
    setUploading(false);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl neu p-4 sm:flex-row sm:items-center">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-espresso-700">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image_url || "/food/food-1.jpg"} alt={item.name} className="h-full w-full object-cover" />
        <button
          onClick={() => fileRef.current?.click()}
          className="absolute inset-0 grid place-items-center bg-espresso-900/0 text-transparent transition-all hover:bg-espresso-900/60 hover:text-ivory"
          aria-label="Change image"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin text-ivory" /> : <ImageIcon className="h-5 w-5" />}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={pick} className="hidden" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-bold text-ivory">{item.name}</h3>
        <select
          value={item.category_id ?? ""}
          onChange={(e) => onCategory(e.target.value)}
          className="mt-1 rounded-lg neu-inset px-2 py-1 font-body text-xs text-ivory/70 focus:outline-none"
        >
          <option value="" className="bg-espresso-700">Uncategorised</option>
          {categories.map((c) => (
            <option key={c} value={c} className="bg-espresso-700">{c}</option>
          ))}
        </select>
        <button
          onClick={() => fileRef.current?.click()}
          className="ml-2 font-body text-xs text-amber-glow hover:underline"
        >
          {uploading ? "Uploading…" : "Replace photo"}
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-xl neu-inset px-3 py-2">
        <IndianRupee className="h-4 w-4 text-ivory/40" />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={() => onPrice(Number(price) || 0)}
          className="w-16 bg-transparent font-body font-bold text-ivory focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <span className={`font-body text-xs font-semibold ${item.available ? "text-leaf" : "text-ivory/40"}`}>
          {item.available ? "Available" : "Sold out"}
        </span>
        <Toggle on={item.available} onChange={onToggle} label="Availability" />
      </div>

      <button
        onClick={onRemove}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl neu text-ivory/40 transition-colors hover:text-terracotta"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function AddItem({
  setMenu,
  categories,
  onDone,
  onError,
}: {
  setMenu: React.Dispatch<React.SetStateAction<MenuRow[]>>;
  categories: string[];
  onDone: () => void;
  onError: (m: string) => void;
}) {
  const [name, setName] = useState("");
  const [rupees, setRupees] = useState("60");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (name.trim().length < 2 || saving) return;
    const sb = supabaseBrowser();
    if (!sb) return;
    setSaving(true);
    const { data, error } = await sb
      .from("menu_items")
      .insert({
        name: name.trim(),
        description: desc.trim() || "Freshly made in-house.",
        price_paise: rupeesToPaise(Number(rupees) || 0),
        category_id: category || null,
        available: true,
        is_veg: true,
      })
      .select("*")
      .single();
    setSaving(false);
    if (error) { onError(error.message); return; }
    setMenu((prev) => [...prev, data as MenuRow]);
    onDone();
  };

  return (
    <div className="mb-5 rounded-2xl glass p-6">
      <h3 className="font-display text-xl font-bold text-ivory">New dish</h3>
      <div className="mt-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dish name"
          className="w-full rounded-xl neu-inset px-4 py-3 font-body text-ivory placeholder:text-ivory/30 focus:outline-none focus:ring-2 focus:ring-amber/50"
        />
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl neu-inset px-3">
            <IndianRupee className="h-4 w-4 text-ivory/40" />
            <input
              type="number"
              value={rupees}
              onChange={(e) => setRupees(e.target.value)}
              className="w-20 bg-transparent py-3 font-body font-bold text-ivory focus:outline-none"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 rounded-xl neu-inset px-4 font-body text-ivory focus:outline-none"
          >
            <option value="" className="bg-espresso-700">Uncategorised</option>
            {categories.map((c) => (
              <option key={c} value={c} className="bg-espresso-700">{c}</option>
            ))}
          </select>
        </div>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Short description"
          rows={2}
          className="w-full rounded-xl neu-inset px-4 py-3 font-body text-ivory placeholder:text-ivory/30 focus:outline-none focus:ring-2 focus:ring-amber/50"
        />
        <p className="font-body text-xs text-ivory/40">
          Tip: add the photo after saving — use “Replace photo” on the new item.
        </p>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl clay px-5 py-3 font-body font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save dish
        </button>
        <button onClick={onDone} className="rounded-xl neu px-5 py-3 font-body font-semibold text-ivory/70">
          Cancel
        </button>
      </div>
    </div>
  );
}
