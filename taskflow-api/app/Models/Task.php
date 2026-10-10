<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
#[Fillable('title', 'customer_name', 'description', 'status', 'due_date')]
class Task extends Model
{
    //
}
