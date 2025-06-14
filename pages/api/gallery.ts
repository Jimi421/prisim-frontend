const fetchGallery = async () => {
  try {
    const res = await fetch("/api/gallery");
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Invalid gallery data:", data);
      setImages([]);
      return;
    }

    setImages(data);
  } catch (err) {
    console.error("Failed to load gallery:", err);
    setImages([]);
  }
};

