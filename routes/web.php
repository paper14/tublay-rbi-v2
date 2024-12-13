<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecordsController;
use App\Http\Controllers\NationalIDVerificationController;
use App\Http\Middleware\HandleLog;
use App\Models\Record;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        // 'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->middleware(HandleLog::class);

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::post('/national-id-verification/api/validate', [NationalIDVerificationController::class, 'validate'])->middleware(['auth', 'verified'])->name('national-id-verification');
Route::get('/national-id-verification', [NationalIDVerificationController::class, 'index'])->middleware(['auth', 'verified'])->name('national-id-verification');

Route::post('/records/api/validate', [RecordsController::class, 'validate'])->middleware(['auth', 'verified'])->name('records');
Route::get('/records', [RecordsController::class, 'index'])->middleware(['auth', 'verified'])->name('records');
Route::post('/records', [RecordsController::class, 'search'])->middleware(['auth', 'verified'])->name('records');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
