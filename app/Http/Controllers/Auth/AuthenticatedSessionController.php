<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Spatie\Permission\Models\Role;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): View
    {
        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();
        if (! $user->hasAnyRole(['admin', 'teacher', 'student'])) {
            $user->assignRole(Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']));
        }

        $target = $user->hasRole('admin') ? 'admin.dashboard' : ($user->hasRole('teacher') ? 'teacher.dashboard' : 'student.dashboard');
        // Always send users to the dashboard for their role. An old intended
        // URL may point to a removed page and cause a confusing 404 after login.
        return redirect()->route($target);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
