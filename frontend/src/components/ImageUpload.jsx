import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { X, Camera } from "lucide-react";

export const ImageUpload = forwardRef(function ImageUpload({ onImageSelect, currentImages = [], label = "Medicine Images" }, ref) {
  const fileInputRef = useRef(null);
  const [previews, setPreviews] = useState(currentImages);
  const acceptedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  const openFilePicker = () => fileInputRef.current?.click();

  useImperativeHandle(ref, () => ({ openFilePicker }));

  useEffect(() => {
    setPreviews(currentImages || []);
  }, [JSON.stringify(currentImages)]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Validate file type
    if (files.some((file) => !acceptedImageTypes.includes(file.type))) {
      alert("Please choose only PNG, JPG, GIF, or WebP images.");
      e.target.value = "";
      return;
    }

    // Validate file size (max 5MB)
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      alert("Each image must be less than 5MB.");
      e.target.value = "";
      return;
    }

    try {
      const selected = await Promise.all(files.map((file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ file, preview: reader.result, name: file.name });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      })));
      setPreviews((current) => [...current, ...selected.map((image) => image.preview)]);
      onImageSelect(selected);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Error processing image");
    }
  };

  const handleClearImage = (index) => {
    setPreviews((current) => current.filter((_, imageIndex) => imageIndex !== index));
    onImageSelect({ removeIndex: index });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {previews.length ? (
        <div className="grid grid-cols-2 gap-2">
          {previews.map((preview, index) => <div key={`${preview}-${index}`} className="relative h-28 bg-slate-800 rounded-lg overflow-hidden">
            <img src={preview} alt={`Medicine ${index + 1}`} className="w-full h-full object-cover" />
            <button type="button" onClick={() => handleClearImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition" title="Remove image"><X className="w-3 h-3" /></button>
          </div>)}
          <button type="button" onClick={openFilePicker} className="h-28 border-2 border-dashed border-slate-700 rounded-lg text-xs text-slate-400 hover:border-teal-400">+ Add more</button>
        </div>
      ) : (
        <div
          onClick={openFilePicker}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
        >
          <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Click to choose a medicine photo</p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, or WebP — up to 5MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
});
