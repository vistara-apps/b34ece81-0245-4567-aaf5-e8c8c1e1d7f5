'use client';

import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { TextArea } from './TextArea';
import type { Item, ItemCategory, ItemCondition } from '../lib/types';

interface ListItemFormProps {
  onSubmit: (item: Omit<Item, 'itemId' | 'lenderUserId' | 'lat' | 'lng'>) => void;
  onCancel: () => void;
}

export function ListItemForm({ onSubmit, onCancel }: ListItemFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other' as ItemCategory,
    condition: 'good' as ItemCondition,
    imageUrl: '',
    borrowingFee: 0.005,
    isAvailable: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories: ItemCategory[] = ['tools', 'electronics', 'books', 'sports', 'kitchen', 'garden', 'other'];
  const conditions: ItemCondition[] = ['excellent', 'good', 'fair'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.borrowingFee < 0) {
      newErrors.borrowingFee = 'Fee must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Generate placeholder image if none provided
    const imageUrl = formData.imageUrl || 
      `https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=${encodeURIComponent(formData.title)}`;

    onSubmit({
      ...formData,
      imageUrl
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Item Title"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        placeholder="e.g., Power Drill, Stand Mixer"
        error={errors.title}
        required
      />

      <TextArea
        label="Description"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="Describe your item, its condition, and any special instructions..."
        error={errors.description}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="input"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Condition
          </label>
          <select
            value={formData.condition}
            onChange={(e) => handleChange('condition', e.target.value)}
            className="input"
          >
            {conditions.map(condition => (
              <option key={condition} value={condition}>
                {condition.charAt(0).toUpperCase() + condition.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Image URL (optional)"
        type="url"
        value={formData.imageUrl}
        onChange={(e) => handleChange('imageUrl', e.target.value)}
        placeholder="https://example.com/image.jpg"
      />

      <Input
        label="Borrowing Fee (ETH per day)"
        type="number"
        step="0.001"
        min="0"
        value={formData.borrowingFee}
        onChange={(e) => handleChange('borrowingFee', parseFloat(e.target.value) || 0)}
        error={errors.borrowingFee}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isAvailable"
          checked={formData.isAvailable}
          onChange={(e) => handleChange('isAvailable', e.target.checked)}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="isAvailable" className="text-sm text-text-primary">
          Available for borrowing
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          List Item
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
