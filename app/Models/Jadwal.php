<?php

// app\Models\Mahasiswa.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jadwal extends Model
{
    use HasFactory;

    protected $table = 'jadwals'; // Specify the actual table name if different
    protected $fillable = ['hari', 'jam_mulai','matakuliah_id'];

    public function matakuliah()
    {
        return $this->belongsTo(Matakuliah::class, 'matakuliah_id', 'id');
    }
    
    // ... (you may add relationships or other model-specific methods here)
}

