<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RequestableAsset;
use Carbon\Carbon;

class RequestableAssetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $assets = [
            [
                'name' => 'Sound System Package',
                'description' => 'Complete sound system with speakers, microphones, and mixer for events and gatherings.',
                'category' => 'Electronics',
                'condition' => 'excellent',
                'status' => 'available',
                'price' => 500.00,
                'stock' => 2,
                'location' => 'Barangay Hall Storage',
                'notes' => 'Includes 2 wireless microphones and cables',
                'image' => '/storage/assets/sound-system.jpg',
                'available_dates' => [
                    Carbon::now()->addDays(1)->format('Y-m-d'),
                    Carbon::now()->addDays(3)->format('Y-m-d'),
                    Carbon::now()->addDays(5)->format('Y-m-d'),
                    Carbon::now()->addDays(7)->format('Y-m-d'),
                ],
                'rating' => 4.8,
                'reviews_count' => 12,
                'is_active' => true,
                'created_by' => 'admin'
            ],
            [
                'name' => 'Projector and Screen',
                'description' => 'HD projector with 10ft screen for presentations and movie nights.',
                'category' => 'Electronics',
                'condition' => 'good',
                'status' => 'available',
                'price' => 300.00,
                'stock' => 1,
                'location' => 'Barangay Hall Storage',
                'notes' => 'Includes HDMI cable and remote control',
                'image' => '/storage/assets/projector.jpg',
                'available_dates' => [
                    Carbon::now()->addDays(2)->format('Y-m-d'),
                    Carbon::now()->addDays(4)->format('Y-m-d'),
                    Carbon::now()->addDays(6)->format('Y-m-d'),
                ],
                'rating' => 4.5,
                'reviews_count' => 8,
                'is_active' => true,
                'created_by' => 'admin'
            ],
            [
                'name' => 'Event Tents (10x10)',
                'description' => 'Large event tents perfect for outdoor activities and celebrations.',
                'category' => 'Event Equipment',
                'condition' => 'good',
                'status' => 'available',
                'price' => 200.00,
                'stock' => 5,
                'location' => 'Barangay Hall Storage',
                'notes' => 'Includes stakes and ropes',
                'image' => '/storage/assets/tent.jpg',
                'available_dates' => [
                    Carbon::now()->addDays(1)->format('Y-m-d'),
                    Carbon::now()->addDays(2)->format('Y-m-d'),
                    Carbon::now()->addDays(3)->format('Y-m-d'),
                    Carbon::now()->addDays(4)->format('Y-m-d'),
                    Carbon::now()->addDays(5)->format('Y-m-d'),
                ],
                'rating' => 4.2,
                'reviews_count' => 15,
                'is_active' => true,
                'created_by' => 'admin'
            ],
            [
                'name' => 'Folding Chairs (50 pcs)',
                'description' => 'Set of 50 folding chairs for events and meetings.',
                'category' => 'Furniture',
                'condition' => 'good',
                'status' => 'available',
                'price' => 150.00,
                'stock' => 3,
                'location' => 'Barangay Hall Storage',
                'notes' => 'Easy to transport and set up',
                'image' => '/storage/assets/chairs.jpg',
                'available_dates' => [
                    Carbon::now()->addDays(1)->format('Y-m-d'),
                    Carbon::now()->addDays(3)->format('Y-m-d'),
                    Carbon::now()->addDays(5)->format('Y-m-d'),
                ],
                'rating' => 4.0,
                'reviews_count' => 6,
                'is_active' => true,
                'created_by' => 'admin'
            ],
            [
                'name' => 'Tables (8ft)',
                'description' => '8-foot folding tables for events and gatherings.',
                'category' => 'Furniture',
                'condition' => 'fair',
                'status' => 'available',
                'price' => 100.00,
                'stock' => 4,
                'location' => 'Barangay Hall Storage',
                'notes' => 'Some minor scratches but fully functional',
                'image' => '/storage/assets/tables.jpg',
                'available_dates' => [
                    Carbon::now()->addDays(2)->format('Y-m-d'),
                    Carbon::now()->addDays(4)->format('Y-m-d'),
                    Carbon::now()->addDays(6)->format('Y-m-d'),
                ],
                'rating' => 3.8,
                'reviews_count' => 4,
                'is_active' => true,
                'created_by' => 'admin'
            ],
            [
                'name' => 'First Aid Kit',
                'description' => 'Complete first aid kit with medical supplies for emergencies.',
                'category' => 'Health & Safety',
                'condition' => 'excellent',
                'status' => 'available',
                'price' => 50.00,
                'stock' => 2,
                'location' => 'Barangay Hall Storage',
                'notes' => 'Regularly checked and restocked',
                'image' => '/storage/assets/first-aid.jpg',
                'available_dates' => [
                    Carbon::now()->addDays(1)->format('Y-m-d'),
                    Carbon::now()->addDays(2)->format('Y-m-d'),
                    Carbon::now()->addDays(3)->format('Y-m-d'),
                    Carbon::now()->addDays(4)->format('Y-m-d'),
                    Carbon::now()->addDays(5)->format('Y-m-d'),
                ],
                'rating' => 4.9,
                'reviews_count' => 3,
                'is_active' => true,
                'created_by' => 'admin'
            ],
            [
                'name' => 'Generator (5kW)',
                'description' => 'Portable generator for power backup during events.',
                'category' => 'Tools',
                'condition' => 'good',
                'status' => 'maintenance',
                'price' => 800.00,
                'stock' => 1,
                'location' => 'Barangay Hall Storage',
                'notes' => 'Currently under maintenance - available next week',
                'image' => '/storage/assets/generator.jpg',
                'available_dates' => [
                    Carbon::now()->addDays(7)->format('Y-m-d'),
                    Carbon::now()->addDays(8)->format('Y-m-d'),
                    Carbon::now()->addDays(9)->format('Y-m-d'),
                ],
                'rating' => 4.6,
                'reviews_count' => 7,
                'is_active' => true,
                'created_by' => 'admin'
            ],
            [
                'name' => 'Cooler Boxes (Large)',
                'description' => 'Large cooler boxes for keeping food and drinks cold during events.',
                'category' => 'Event Equipment',
                'condition' => 'good',
                'status' => 'available',
                'price' => 75.00,
                'stock' => 6,
                'location' => 'Barangay Hall Storage',
                'notes' => 'Perfect for outdoor events',
                'image' => '/storage/assets/cooler.jpg',
                'available_dates' => [
                    Carbon::now()->addDays(1)->format('Y-m-d'),
                    Carbon::now()->addDays(2)->format('Y-m-d'),
                    Carbon::now()->addDays(3)->format('Y-m-d'),
                    Carbon::now()->addDays(4)->format('Y-m-d'),
                    Carbon::now()->addDays(5)->format('Y-m-d'),
                ],
                'rating' => 4.3,
                'reviews_count' => 9,
                'is_active' => true,
                'created_by' => 'admin'
            ]
        ];

        foreach ($assets as $asset) {
            RequestableAsset::create($asset);
        }
    }
}
