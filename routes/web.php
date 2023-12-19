<?php

use App\Http\Controllers\AbsensiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/', function () {
//     return view('home');
// });
// routes\web.php




Route::get('/', [AbsensiController::class, 'dashboardView'])->name('dashboardView');
Route::get('/absensi', [AbsensiController::class, 'absensiView'])->name('absensiView');
Route::get('/absensi/create', [AbsensiController::class, 'create'])->name('absensiCreate');
Route::post('/absensi', [AbsensiController::class, 'store'])->name('absensi.store');
Route::get('/generate-absensi', [AbsensiController::class, 'generateAbsensi'])->name('generate-absensi');
Route::get('/scan-absensi', [AbsensiController::class, 'scanAbsensi'])->name('scan-absensi');
Route::post('/update-status', [AbsensiController::class, 'updateStatus'])->name('update-status');



