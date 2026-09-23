<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrganizationController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/organization', [OrganizationController::class, 'index'])->name('organization.index');
    Route::get('/organization/{organization}', [OrganizationController::class, 'show'])->name('organization.show');
    Route::get('/organization/{organization}/plan', [OrganizationController::class, 'editPlan'])
        ->name('organization.plan');
    Route::post(
        '/organization/{organization}/assign-plan',
        [OrganizationController::class, 'assignPlan']
    )->name('organization.assignPlan');
});

require __DIR__ . '/auth.php';
