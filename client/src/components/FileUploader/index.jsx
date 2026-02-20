import React, { useState } from "react";
import styles from "./FileUploader.module.scss";

const FileUploader = ({ onChange, accept = "image/*", label = "Choose file", preview = false, initialPreview }) => {
  const [filePreview, setFilePreview] = useState(initialPreview || null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Создаём preview, если нужно
    if (preview) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    }

    // Передаём выбранный файл родителю
    if (onChange) onChange(file);
  };

  return (
    <div className={styles.uploader}>
      {preview && filePreview && (
        <img src={filePreview} alt="Preview" className={styles.preview} />
      )}
      <label className={styles.button}>
        {label}
        <input type="file" accept={accept} onChange={handleChange} />
      </label>
    </div>
  );
};

export default FileUploader;