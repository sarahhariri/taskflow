<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Task::create([
    'title' => "Prepare Sarah's gift",
    'customer_name' => 'Sarah',
    'description' => 'Wrap the gift and prepare it for delivery.',
    'status' => 'new',
    'due_date' => now()->addDays(3)->toDateString(),
]);
    }
}
