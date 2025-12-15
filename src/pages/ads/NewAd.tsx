import { useState } from 'react';
import './styles/NewAd.css';
import { defaultCharacteristics } from '../../models/AdsModels';
import fetchData from '../../utils/fetchData';
import { CATEGORIES } from '../../models/AdsModels';

import type { AdModel, CharacteristicsModel, CreateAdModel } from '../../models/AdsModels';
import type { CreateAdResponseModel } from '../../models/ResponseModel';

const categories = Object.values(CATEGORIES);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function NewAd({ onCreated, onClose }: {
  onCreated: (ad: AdModel) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [images, setImages] = useState<string[]>(['', '', '']);

  const [characteristics, setCharacteristics] = useState<CharacteristicsModel>(defaultCharacteristics);

  const handleChangeCharacteristic = (key: string, value: string) => {
    setCharacteristics(prev => ({ ...prev, [key]: value }));
  };

  const updateImageLink = (index: number, value: string) => {
    const copy = [...images];
    copy[index] = value;
    setImages(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validImages = images.filter(url => url.trim().length > 0);
    const body = {
      title,
      description,
      price,
      category,
      images: validImages,
      characteristics
    } as CreateAdModel;

    try {
      const data = await fetchData<CreateAdResponseModel>(`${API_URL}/api/v1/ads/createAd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      onCreated(data.ad);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Неизвестная ошибка при создании объявления");
      }
    }
  };

  return (
    <div className='newad-backdrop'>
      <div className='newad-modal'>
        <h2>Создать объявление</h2>

        <form onSubmit={handleSubmit}>
          <label>Название (обязательно)</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />

          <label>Цена (обязательно)</label>
          <input type='number' value={price} required
            onChange={(e) => setPrice(e.target.value)}
          />

          <label>Категория (обязательно)</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="" disabled>Выберите категорию</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label>Описание</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)}/>

          <h3>Картинки (ссылки на открытые источники)</h3>
          <p>(Впоследствии может быть заменено на загрузку файлов)</p>
          {images.map((img, i) => (
            <input key={i} value={img}
              placeholder={`URL картинки ${i + 1} (не обязательно)`}
              onChange={(e) => updateImageLink(i, e.target.value)}
            />
          ))}

          <h3>Характеристики (не обязательно)</h3>
          {Object.keys(characteristics).map((key) => (
            <div key={key}>
              <label>{key}</label>
              <input
                value={(characteristics as any)[key]}
                onChange={(e) => handleChangeCharacteristic(key, e.target.value)}
              />
            </div>
          ))}

          <div className='btn-row'>
            <button type='button' onClick={onClose} className='cancel-btn'>
              Отмена
            </button>
            <button type='submit' className='submit-btn'>
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
