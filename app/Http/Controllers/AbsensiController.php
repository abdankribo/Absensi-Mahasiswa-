<?php

// app\Http\Controllers\AbsensiController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Absensi; // Make sure to import the Absensi model
use App\Models\Mahasiswa;
use App\Models\Jadwal;
use App\Models\Matakuliah;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class AbsensiController extends Controller
{
    // app\Http\Controllers\AbsensiController.php

    public function absensiView()
    {
        $absensis = Absensi::with(['mahasiswa', 'matakuliah', 'jadwal'])
        ->select('id', 'mahasiswa_id', 'jadwal_id','matakuliah_id', 'tanggal_absensi', 'status')
        ->get();
        return view('absensi.index', ['absensis' => $absensis]);
    }
    
    public function create()
    {
        $jadwals = Jadwal::all(); 
        $mahasiswas = Mahasiswa::all(); 
        $matakuliahs = Matakuliah::all();// Fetch all students
        
        return view('absensi.create', compact('jadwals', 'mahasiswas','matakuliahs'));
    }

    // public function scanAbsensi()
    // {
    //     // Fetch necessary data (e.g., mahasiswa, matakuliah, jadwal) for the view
    //     $mahasiswas = Mahasiswa::all();
    //     $matakuliahs = Matakuliah::all();
    //     $jadwals = Jadwal::all();

    //     return view('absensi.scan', compact('mahasiswas', 'matakuliahs', 'jadwals'));
    // }
    public function generateAbsensi(Request $request)
    {
        // Retrieve data from the QR code
        $mahasiswa_id = $request->input('mahasiswa_id');
        $matakuliah_id = $request->input('matakuliah_id');
        $jadwal_id = $request->input('jadwal_id');
        $tanggal_absensi = $request->input('tanggal_absensi');
        $status = $request->input('status');
    
        // Create a new Absensi model instance and fill it with the QR code data
        $absensi = new Absensi([
            'mahasiswa_id' => $mahasiswa_id,
            'jadwal_id' => $jadwal_id,
            'matakuliah_id' => $matakuliah_id,
            'tanggal_absensi' => $tanggal_absensi,
            'status' => $status,
            // Add other fields if needed
        ]);
    
        // Save the model to the database
        $absensi->save();
    
        // Optionally, you can redirect the user or return a response
        return redirect()->route('absensiView')->with('success', 'Absensi added successfully');
    }
    
    // Di dalam controller
    public function dashboardView()
    {
        $absensis = Absensi::all(); // Gantilah dengan query yang sesuai
        return view('dashboard', ['absensis' => $absensis]);
    }

        
    public function store(Request $request)
    {
        dd($request->all());
        // Validate the request data as needed
        $request->validate([
            'mahasiswa_id' => 'required',
            'jadwal_id' => 'required',
            'matakuliah_id' => 'required',
            'tanggal_absensi' => 'required',
            'status' => 'required',
        ]);

        // Create a new Absensi model instance and fill it with the request data
        $absensi = new Absensi([
            'mahasiswa_id' => $request->input('mahasiswa_id'),
            'jadwal_id' => $request->input('jadwal_id'),
            'matakuliah_id' => $request->input('matakuliah_id'),
            'tanggal_absensi' => $request->input('tanggal_absensi'),
            'status' => $request->input('status'),
            // Add other fields if needed
        ]);

        // Save the model to the database
        $absensi->save();

        // Generate QR code
        $qrCode = QrCode::format('png')->generate(route('generate-absensi', ['id' => $absensi->id]));
        $qrCodePath = 'qrcodes/' . $absensi->id . '.png';

        // Save QR code to storage
        Storage::disk('public')->put($qrCodePath, $qrCode);

        // Update Absensi model with QR code path
        $absensi->update(['qrcode_path' => $qrCodePath]);

        // Optionally, you can redirect the user to a success page or return a response
        return redirect()->route('absensiView')->with('success', 'Absensi added successfully');
    }

}
