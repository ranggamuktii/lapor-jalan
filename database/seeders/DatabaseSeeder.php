<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin Utama',
            'email' => 'admin@laporjalan.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'Warga Cikampek',
            'email' => 'warga@laporjalan.com',
            'password' => bcrypt('password'),
            'role' => 'citizen',
        ]);

        $categories = [
            'Jalan Rusak',
            'Lampu Jalan Mati',
        ];

        foreach ($categories as $category) {
            \App\Models\Category::create([
                'name' => $category,
            ]);
        }
    }
}
