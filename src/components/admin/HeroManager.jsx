'use client';

import { useEffect, useState } from 'react';

export default function HeroManager() {
  const [images, setImages] = useState([]);
  const [image, setImage] = useState('');

  const loadImages = async () => {
    const res = await fetch('/api/hero-images');
    const data = await res.json();
    setImages(data);
  };

  useEffect(() => {
    loadImages();
  }, []);

  const addImage = async () => {
    if (!image) return alert('Enter image URL');

    await fetch('/api/hero-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image }),
    });

    setImage('');
    loadImages();
  };

  const deleteImage = async (id) => {
    await fetch('/api/hero-images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    loadImages();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Hero Images Manager</h2>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Image URL"
        />
        <button onClick={addImage}>Add</button>
      </div>

      <div style={{ marginTop: 20 }}>
        {images.map((img) => (
          <div key={img._id} style={{ marginBottom: 10 }}>
            <img src={img.image} width="200" />
            <button onClick={() => deleteImage(img._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
