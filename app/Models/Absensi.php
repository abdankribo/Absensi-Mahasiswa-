<?php

// app\Models\Absensi.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Absensi extends Model
{
    use HasFactory;

    protected $table = 'absensis'; // Specify the table name if it's different from the model name in plural form.
    protected $fillable = [
        'mahasiswa_id',
        'jadwal_id',
        'matakuliah_id',
        'tanggal_absensi',
        'status',
        'qrcode_path',
        // Add other fillable columns here
    ];    

    // public $timestamps = false; // Disable timestamps

    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id', 'nim');
    }

    public function matakuliah()
    {
        return $this->belongsTo(Matakuliah::class, 'matakuliah_id', 'id');
    }
    
    public function jadwal()
    {
        return $this->belongsTo(Jadwal::class, 'jadwal_id', 'id');
    }
    // You may also define relationships, scopes, or other model-specific methods here
}
