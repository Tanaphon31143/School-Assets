<x-guest-layout>
    <div class="mb-9 text-center">
        <p class="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">School Assets</p>
        <h1 class="text-2xl font-bold leading-relaxed tracking-tight text-slate-900">ยินดีต้อนรับกลับ</h1>
        <p class="mt-2 text-sm leading-7 text-slate-500">เข้าสู่ระบบจัดการครุภัณฑ์โรงเรียน</p>
    </div>
    <x-auth-session-status class="mb-4" :status="session('status')" />
    @if ($errors->any())
        <div class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{{ $errors->first() }}</div>
    @endif
    <form method="POST" action="{{ route('login') }}" class="space-y-5">
        @csrf
        <div>
            <x-input-label for="email" value="อีเมล" />
            <x-text-input id="email" class="mt-2 block min-h-12 w-full" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>
        <div>
            <x-input-label for="password" value="รหัสผ่าน" />
            <x-text-input id="password" class="mt-2 block min-h-12 w-full" type="password" name="password" required autocomplete="current-password" />
            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>
        <div class="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <label class="inline-flex items-center text-slate-600">
                <input type="checkbox" class="rounded border-slate-300 text-blue-600 shadow-sm focus:ring-blue-500" name="remember">
                <span class="ms-2">จดจำการเข้าสู่ระบบ</span>
            </label>
            @if (Route::has('password.request'))
                <a class="font-medium text-blue-600 hover:text-blue-700 hover:underline" href="{{ route('password.request') }}">ลืมรหัสผ่าน?</a>
            @endif
        </div>
        <button type="submit" class="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">เข้าสู่ระบบ</button>
    </form>
    @if (Route::has('register'))
        <p class="mt-7 text-center text-sm text-slate-500">ยังไม่มีบัญชี? <a class="font-semibold text-blue-600 hover:text-blue-700 hover:underline" href="{{ route('register') }}">สมัครใช้งาน</a></p>
    @endif
</x-guest-layout>
