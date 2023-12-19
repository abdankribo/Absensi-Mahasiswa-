<?php

// app\Models\Mahasiswa.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Matakuliah extends Model
{
    use HasFactory;

    protected $table = 'matakuliahs'; // Specify the actual table name if different
    protected $fillable = ['nama_matakuliah', 'sks'];

    // ... (you may add relationships or other model-specific methods here)
}

