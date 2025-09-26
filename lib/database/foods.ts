import { createClient } from "@/lib/supabase/universal";
import type { Food } from "./types";

export async function getFoods(): Promise<Food[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching foods:", error);
    throw new Error("Failed to fetch foods");
  }

  return data || [];
}

export async function getFoodById(id: string): Promise<Food | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching food:", error);
    return null;
  }

  return data;
}

export async function searchFoods(query: string): Promise<Food[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error searching foods:", error);
    throw new Error("Failed to search foods");
  }

  return data || [];
}

export async function getFoodsByCategory(category: string): Promise<Food[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .eq("category", category)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching foods by category:", error);
    throw new Error("Failed to fetch foods by category");
  }

  return data || [];
}

export async function getFoodsByDoshaEffect(
  dosha: "vata" | "pitta" | "kapha",
  effect: "Increase" | "Decrease" | "Neutral"
): Promise<Food[]> {
  const supabase = await createClient();

  const column = `${dosha}_effect`;

  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .eq(column, effect)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching foods by dosha effect:", error);
    throw new Error("Failed to fetch foods by dosha effect");
  }

  return data || [];
}

export async function getFoodCategories(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("foods")
    .select("category")
    .order("category", { ascending: true });

  if (error) {
    console.error("Error fetching food categories:", error);
    throw new Error("Failed to fetch food categories");
  }

  // Extract unique categories
  const categories = [...new Set(data?.map((item) => item.category) || [])];
  return categories;
}

export async function searchFoodsWithGemini(query: string): Promise<Food[]> {
  try {
    const response = await fetch("/api/food-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ searchTerm: query }),
    });

    if (!response.ok) {
      throw new Error("Failed to search foods");
    }

    const data = await response.json();
    return data.foods || [];
  } catch (error) {
    console.error("Error searching foods with Gemini:", error);
    throw new Error("Failed to search foods");
  }
}
