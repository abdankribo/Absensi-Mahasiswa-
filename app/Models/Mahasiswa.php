<?php

// app\Models\Mahasiswa.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mahasiswa extends Model
{
    use HasFactory;

    protected $table = 'mahasiswas'; // Specify the actual table name if different
    protected $fillable = ['nim', 'nama'];
    

    // ... (you may add relationships or other model-specific methods here)
}

