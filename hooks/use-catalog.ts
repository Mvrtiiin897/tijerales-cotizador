"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Category,
  ServiceItem,
  DEFAULT_CATEGORIES,
  RESUMEN_TAB_CATEGORY,
  getCategoryIcon,
} from "@/lib/cotizador-data"

const STORAGE_KEY = "tijerales_catalog_v2"

export function useCatalog() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount (SSR safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Category[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Re-attach icons
          const hydrated = parsed.map((cat) => ({
            ...cat,
            icon: getCategoryIcon(cat),
            items: (cat.items || []).map((item) => ({
              ...item,
              active: item.active !== false, // default true
            })),
          }))
          setCategories(hydrated)
        }
      }
    } catch (e) {
      console.error("Error loading catalog from localStorage:", e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage whenever categories change (after initial load)
  const persistCategories = useCallback((newCategories: Category[]) => {
    setCategories(newCategories)
    try {
      // Strip dynamic react components before JSON serialization
      const serializable = newCategories.map((cat) => ({
        id: cat.id,
        label: cat.label,
        tabLabel: cat.tabLabel || cat.label,
        color: cat.color,
        iconName: cat.iconName || "Tag",
        items: cat.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: Number(item.price) || 0,
          active: item.active !== false,
        })),
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
    } catch (e) {
      console.error("Error saving catalog to localStorage:", e)
    }
  }, [])

  // Add a new Category
  const addCategory = useCallback(
    (data: { label: string; tabLabel?: string; color: string; iconName?: string }) => {
      const id =
        data.label
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") + `-${Date.now().toString().slice(-4)}`

      const newCategory: Category = {
        id,
        label: data.label.toUpperCase(),
        tabLabel: (data.tabLabel || data.label).toUpperCase(),
        color: data.color || "bg-brand-navy",
        iconName: data.iconName || "Tag",
        icon: getCategoryIcon(data.iconName || "Tag"),
        items: [],
      }

      persistCategories([...categories, newCategory])
      return newCategory
    },
    [categories, persistCategories],
  )

  // Update existing category
  const updateCategory = useCallback(
    (
      id: string,
      data: { label?: string; tabLabel?: string; color?: string; iconName?: string },
    ) => {
      const updated = categories.map((cat) => {
        if (cat.id !== id) return cat
        const newLabel = data.label ? data.label.toUpperCase() : cat.label
        const newTabLabel = data.tabLabel
          ? data.tabLabel.toUpperCase()
          : data.label
            ? data.label.toUpperCase()
            : cat.tabLabel
        const newIconName = data.iconName || cat.iconName || "Tag"

        return {
          ...cat,
          label: newLabel,
          tabLabel: newTabLabel,
          color: data.color || cat.color,
          iconName: newIconName,
          icon: getCategoryIcon(newIconName),
        }
      })
      persistCategories(updated)
    },
    [categories, persistCategories],
  )

  // Delete Category
  const deleteCategory = useCallback(
    (id: string) => {
      const filtered = categories.filter((cat) => cat.id !== id)
      persistCategories(filtered)
    },
    [categories, persistCategories],
  )

  // Add Service to a category
  const addService = useCallback(
    (data: {
      categoryId: string
      name: string
      description?: string
      price: number
      active?: boolean
    }) => {
      const serviceId =
        data.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") + `-${Date.now().toString().slice(-4)}`

      const newItem: ServiceItem = {
        id: serviceId,
        name: data.name.toUpperCase(),
        description: data.description || "",
        price: Number(data.price) || 0,
        active: data.active !== false,
      }

      const updated = categories.map((cat) => {
        if (cat.id === data.categoryId) {
          return {
            ...cat,
            items: [...cat.items, newItem],
          }
        }
        return cat
      })

      persistCategories(updated)
      return newItem
    },
    [categories, persistCategories],
  )

  // Update existing Service (can also move across categories)
  const updateService = useCallback(
    (
      currentCategoryId: string,
      serviceId: string,
      data: {
        name?: string
        description?: string
        price?: number
        active?: boolean
        targetCategoryId?: string
      },
    ) => {
      const targetCatId = data.targetCategoryId || currentCategoryId

      let targetItem: ServiceItem | null = null

      // Find item
      for (const cat of categories) {
        const found = cat.items.find((i) => i.id === serviceId)
        if (found) {
          targetItem = {
            ...found,
            name: data.name !== undefined ? data.name.toUpperCase() : found.name,
            description: data.description !== undefined ? data.description : found.description,
            price: data.price !== undefined ? Number(data.price) || 0 : found.price,
            active: data.active !== undefined ? data.active : found.active !== false,
          }
          break
        }
      }

      if (!targetItem) return

      let updated: Category[]

      if (currentCategoryId === targetCatId) {
        // Same category
        updated = categories.map((cat) => {
          if (cat.id === currentCategoryId) {
            return {
              ...cat,
              items: cat.items.map((i) => (i.id === serviceId ? (targetItem as ServiceItem) : i)),
            }
          }
          return cat
        })
      } else {
        // Moved to another category
        updated = categories.map((cat) => {
          if (cat.id === currentCategoryId) {
            return {
              ...cat,
              items: cat.items.filter((i) => i.id !== serviceId),
            }
          }
          if (cat.id === targetCatId) {
            return {
              ...cat,
              items: [...cat.items, targetItem as ServiceItem],
            }
          }
          return cat
        })
      }

      persistCategories(updated)
    },
    [categories, persistCategories],
  )

  // Toggle active / inactive state of a service
  const toggleServiceActive = useCallback(
    (categoryId: string, serviceId: string) => {
      const updated = categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.map((item) => {
              if (item.id === serviceId) {
                return { ...item, active: item.active === false ? true : false }
              }
              return item
            }),
          }
        }
        return cat
      })
      persistCategories(updated)
    },
    [categories, persistCategories],
  )

  // Delete a service
  const deleteService = useCallback(
    (categoryId: string, serviceId: string) => {
      const updated = categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.filter((i) => i.id !== serviceId),
          }
        }
        return cat
      })
      persistCategories(updated)
    },
    [categories, persistCategories],
  )

  // Reset to original initial default catalog
  const resetToDefaults = useCallback(() => {
    const fresh = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      icon: getCategoryIcon(cat),
      items: cat.items.map((item) => ({ ...item, active: true })),
    }))
    persistCategories(fresh)
  }, [persistCategories])

  // Active categories for client quote view (includes only active items + Resumen tab)
  const activeCategories = useMemo(() => {
    const filtered = categories.map((cat) => ({
      ...cat,
      items: cat.items.filter((i) => i.active !== false),
    }))
    return [...filtered, RESUMEN_TAB_CATEGORY]
  }, [categories])

  // Catalog statistics for admin dashboard
  const stats = useMemo(() => {
    let totalServices = 0
    let activeServices = 0
    let inactiveServices = 0

    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        totalServices++
        if (item.active !== false) {
          activeServices++
        } else {
          inactiveServices++
        }
      })
    })

    return {
      totalCategories: categories.length,
      totalServices,
      activeServices,
      inactiveServices,
    }
  }, [categories])

  return {
    categories,
    activeCategories,
    isLoaded,
    stats,
    addCategory,
    updateCategory,
    deleteCategory,
    addService,
    updateService,
    deleteService,
    toggleServiceActive,
    resetToDefaults,
    persistCategories,
  }
}
