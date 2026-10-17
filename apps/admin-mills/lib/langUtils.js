// Utility functions for seamless bilingual formatting across Ladwan Admin PWA

export function formatCustomerName(customer, lang = "hi") {
  if (!customer) return "";
  if (lang === "en") {
    if (customer.englishName) return customer.englishName.trim();
    // If name is in format "आनंद मिश्रा (Anand Mishra)", extract English inside parentheses
    const match = customer.name?.match(/\(([^)]+)\)/);
    if (match && match[1]) return match[1].trim();
    return customer.name || "";
  } else {
    if (customer.name) {
      // Remove English inside parentheses if present, e.g. "आनंद मिश्रा (Anand Mishra)" -> "आनंद मिश्रा"
      return customer.name.replace(/\s*\([^)]*\)/g, "").trim() || customer.name;
    }
    return customer.englishName || "";
  }
}

export function formatAddress(customer, lang = "hi") {
  if (!customer) return "";
  if (lang === "en") {
    return customer.englishAddress || customer.address || "";
  }
  return customer.address || customer.englishAddress || "";
}

export function formatCustomerNote(order, lang = "hi", fallback = "") {
  if (!order) return fallback;
  if (lang === "en") {
    return (
      order.englishSpecialInstructions ||
      order.specialInstructions ||
      fallback ||
      "Fresh ground flour, please pack carefully."
    );
  }
  return (
    order.specialInstructions ||
    order.englishSpecialInstructions ||
    fallback ||
    "ताज़ा पिसा हुआ आटा, कृपया ध्यान से पैक करें।"
  );
}

export function formatOrderItemName(item, lang = "hi", products = []) {
  if (!item) return "";
  if (lang === "en") {
    if (item.englishName) return item.englishName;
    if (item.productId && Array.isArray(products)) {
      const match = products.find((p) => p.id === item.productId);
      if (match?.englishName) return match.englishName;
    }
    return item.name || "";
  }
  return item.name || item.englishName || "";
}

export function formatGrindOption(grind, lang = "hi") {
  if (!grind) return "";
  const str = String(grind).trim();

  if (lang === "en") {
    // If it has English in parentheses like "बारीक (Fine / Roti)", extract the English portion
    const match = str.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      return match[1].trim();
    }
    // Clean translations for known types
    if (str.includes("बारीक")) return "Fine";
    if (str.includes("मध्यम")) return "Medium";
    if (str.includes("मोटा") || str.includes("दरदरा")) return "Coarse";
    if (str.includes("चोकर")) return "High Bran";
    if (str.includes("सत्तू ड्रिंक")) return "Fine Drink Special";
    if (str.includes("बाटी") || str.includes("लिट्टी")) return "Litti Baati Coarse";
    if (str.includes("लड्डू") || str.includes("दानेदार")) return "Coarse (Laddu)";
    if (str.includes("ग्राहक")) return "Custom Grind";
    return str;
  } else {
    // If Hindi, extract the Hindi portion before parentheses
    const beforeParen = str.split("(")[0].trim();
    if (beforeParen) return beforeParen;
    return str;
  }
}

export function formatProductDescription(product, lang = "hi") {
  if (!product) return "";
  if (lang === "en") {
    return product.englishDescription || product.description || "";
  }
  return product.description || product.englishDescription || "";
}

export function formatProductBadge(product, lang = "hi") {
  if (!product) return "";
  if (lang === "en") {
    return product.englishBadge || product.badge || "";
  }
  return product.badge || product.englishBadge || "";
}
