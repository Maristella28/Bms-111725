<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class RequestableAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'condition',
        'status',
        'price',
        'stock',
        'location',
        'notes',
        'image',
        'available_dates',
        'rating',
        'reviews_count',
        'is_active',
        'created_by'
    ];

    protected $casts = [
        'available_dates' => 'array',
        'image' => 'array',
        'price' => 'decimal:2',
        'rating' => 'decimal:2',
        'is_active' => 'boolean',
        'stock' => 'integer',
        'reviews_count' => 'integer'
    ];

    // Accessor for availability status
    protected function availability(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->status === 'available' && $this->stock > 0) {
                    return 'In Stock';
                } elseif ($this->status === 'available' && $this->stock <= 0) {
                    return 'Out of Stock';
                } elseif ($this->status === 'rented') {
                    return 'Rented';
                } elseif ($this->status === 'maintenance') {
                    return 'Maintenance';
                } else {
                    return 'Unavailable';
                }
            }
        );
    }

    // Scope for active assets
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope for available assets
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available')
                    ->where('stock', '>', 0)
                    ->where('is_active', true);
    }

    // Scope for filtering by category
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    // Scope for filtering by condition
    public function scopeByCondition($query, $condition)
    {
        return $query->where('condition', $condition);
    }

    // Get formatted price
    public function getFormattedPriceAttribute()
    {
        return '₱' . number_format((float) $this->price, 2);
    }

    // Get average rating
    public function getAverageRatingAttribute()
    {
        return $this->rating ?? 5.0;
    }

    // Check if asset is available for request
    public function isAvailableForRequest()
    {
        return $this->status === 'available' && 
               $this->stock > 0 && 
               $this->is_active;
    }

    // Get stock status
    public function getStockStatusAttribute()
    {
        if ($this->stock > 10) {
            return 'In Stock';
        } elseif ($this->stock > 0) {
            return 'Limited';
        } else {
            return 'Out of Stock';
        }
    }
}
