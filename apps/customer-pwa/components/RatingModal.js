// apps/customer-pwa/components/RatingModal.js - Post-Delivery Feedback & Atta Quality Review
"use client";

import { useState } from "react";
import { Star, X, Check, Heart, Sparkles, MessageSquare } from "lucide-react";

const FEEDBACK_TAGS = [
  "बहुत स्वादिष्ट व नर्म रोटी",
  "एकदम ताज़ा आटा",
  "उत्तम चोकर युक्त",
  "समय पर डिलीवरी",
  "चक्की मालिक का अच्छा व्यवहार",
  "बढ़िया पैकिंग",
];

export default function RatingModal({
  isOpen,
  onClose,
  order,
  onSubmitReview,
  lang,
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([
    "बहुत स्वादिष्ट व नर्म रोटी",
    "एकदम ताज़ा आटा",
  ]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !order) return null;

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmitReview({
        orderId: order.id,
        millId: order.millId,
        rating,
        tags: selectedTags,
        comment: comment.trim(),
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 1500);
    } catch {
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-100">
                {lang === "hi" ? "आटे की ताज़गी व स्वाद रेट करें" : "Rate Atta Freshness & Quality"}
              </h2>
              <div className="text-[11px] text-stone-400">{order.millName}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-stone-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h3 className="text-base font-bold text-stone-100">
              {lang === "hi" ? "आपकी समीक्षा प्राप्त हुई!" : "Thank You For Your Feedback!"}
            </h3>
            <p className="text-xs text-stone-400">
              {lang === "hi"
                ? "आपकी प्रतिक्रिया से स्थानीय चक्की को गुणवत्ता बनाए रखने में मदद मिलती है।"
                : "Your review supports hyper-local chakkis maintain authentic quality."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Interactive Stars */}
            <div className="text-center space-y-1.5">
              <div className="text-xs text-stone-300 font-semibold">
                {lang === "hi"
                  ? "चक्की के ताज़े पिसे आटे से आप कितने संतुष्ट हैं?"
                  : "How was the taste and freshness of the rotis?"}
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 active:scale-95"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          : "text-stone-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-[11px] font-bold text-amber-400">
                {rating === 5 && "अति उत्तम! एकदम नर्म व स्वादिष्ट रोटी (5/5)"}
                {rating === 4 && "बहुत बढ़िया स्वाद व ताज़गी (4/5)"}
                {rating === 3 && "अच्छा (3/5)"}
                {rating === 2 && "औसत (2/5)"}
                {rating === 1 && "सुधार की आवश्यकता (1/5)"}
              </div>
            </div>

            {/* Quick Feedback Chips */}
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                {lang === "hi" ? "खासियत चुनें" : "What did you like most?"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FEEDBACK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Box */}
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                {lang === "hi" ? "टिप्पणी (वैकल्पिक)" : "Comment (Optional)"}
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  lang === "hi"
                    ? "आटे की नरमी, खुशबू और स्वाद के बारे में लिखें..."
                    : "Share your experience about flour aroma and roti softness..."
                }
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500 placeholder:text-stone-600"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <span>{submitting ? "सबमिट हो रहा है..." : "समीक्षा सबमिट करें (Submit)"}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-colors"
              >
                बाद में (Skip)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
