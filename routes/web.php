<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\BorrowingController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Admin\EquipmentCategoryController;
use App\Http\Controllers\Admin\EquipmentLocationController;
use App\Http\Controllers\Admin\EquipmentController as AdminEquipmentController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\EquipmentDisposalController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => auth()->check() ? redirect()->route('dashboard') : redirect()->route('login'));
Route::get('/scan/equipment/{equipment}', [AssetController::class, 'publicShow'])->name('equipment.public');
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', fn () => redirect()->route(auth()->user()->hasRole('admin') ? 'admin.dashboard' : (auth()->user()->hasRole('teacher') ? 'teacher.dashboard' : 'student.dashboard')))->name('dashboard');
    Route::get('/equipment', [AssetController::class, 'index'])->name('equipment.index');
    Route::get('/equipment/{equipment}', [AssetController::class, 'show'])->name('equipment.show');
    Route::get('/borrowings', [BorrowingController::class, 'index'])->name('borrowings.index');
    Route::get('/notifications', fn () => view('notifications.index', ['notifications'=>auth()->user()->notifications()->latest()->paginate(20)]))->name('notifications.index');
    Route::patch('/notifications/{notification}/read', function (string $notification) { $item = auth()->user()->notifications()->whereKey($notification)->firstOrFail(); $item->markAsRead(); return back(); })->name('notifications.read');
    Route::patch('/notifications/read-all', function () { auth()->user()->unreadNotifications->markAsRead(); return back(); })->name('notifications.read-all');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/borrowings', [BorrowingController::class, 'store'])->name('borrowings.store');
    Route::patch('/borrowings/{borrowing}/approve', [BorrowingController::class, 'approve'])->middleware('role:admin|teacher')->name('borrowings.approve');
    Route::patch('/borrowings/{borrowing}/reject', [BorrowingController::class, 'reject'])->middleware('role:admin|teacher')->name('borrowings.reject');
    Route::patch('/borrowings/{borrowing}/return', [BorrowingController::class, 'return'])->name('borrowings.return');
    Route::post('/maintenance', [MaintenanceController::class, 'store'])->name('maintenance.store');
    Route::get('/maintenance', [MaintenanceController::class, 'index'])->name('maintenance.index');
    Route::patch('/maintenance/{maintenance}', [MaintenanceController::class, 'update'])->middleware('role:admin')->name('maintenance.update');
    Route::get('/reports', [ReportController::class, 'index'])->middleware('role:admin|teacher')->name('reports.index');
    Route::get('/reports/borrowings', [ReportController::class, 'borrowings'])->middleware('role:admin|teacher')->name('reports.borrowings');
    Route::get('/reports/qr-print', [ReportController::class, 'qrPrint'])->middleware('role:admin')->name('reports.qr-print');
    Route::get('/reports/csv', [ReportController::class, 'csv'])->middleware('role:admin|teacher')->name('reports.csv');
    Route::get('/reports/pdf', [ReportController::class, 'pdf'])->middleware('role:admin|teacher')->name('reports.pdf');
    Route::get('/equipment/{equipment}/qr', [ReportController::class, 'qr'])->name('equipment.qr');
});
Route::middleware(['auth','role:admin'])->prefix('admin')->name('admin.')->group(function () { Route::get('/dashboard', [AssetController::class, 'dashboard'])->name('dashboard'); Route::resource('categories', EquipmentCategoryController::class)->except('show')->parameters(['categories'=>'category']); Route::resource('locations', EquipmentLocationController::class)->except('show')->parameters(['locations'=>'location']); Route::resource('equipment', AdminEquipmentController::class); Route::resource('users', AdminUserController::class)->except('show'); Route::get('/activity-log', [ActivityLogController::class, 'index'])->name('activity.index'); Route::resource('disposals', EquipmentDisposalController::class)->only(['index','create','store']); });
Route::middleware(['auth','role:teacher'])->prefix('teacher')->name('teacher.')->group(function () { Route::get('/dashboard', [AssetController::class, 'dashboard'])->name('dashboard'); });
Route::middleware(['auth','role:student'])->prefix('student')->name('student.')->group(function () { Route::get('/dashboard', [AssetController::class, 'dashboard'])->name('dashboard'); });
require __DIR__.'/auth.php';
