<x-guest-layout>
    <div class="mb-9 text-center">
        <p class="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">School Assets</p>
        <h1 class="text-2xl font-bold leading-relaxed tracking-tight text-slate-900">สร้างบัญชีผู้ใช้งาน</h1>
        <p class="mt-2 text-sm leading-7 text-slate-500">เริ่มต้นใช้งานระบบจัดการครุภัณฑ์</p>
    </div>

    @if ($errors->any())
        <div class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700" role="alert">
            {{ $errors->first() }}
        </div>
    @endif

    <form method="POST" action="{{ route('register') }}" class="space-y-5">
        @csrf
        <div>
            <x-input-label for="name" value="ชื่อผู้ใช้งาน" />
            <x-text-input id="name" class="mt-2 block min-h-12 w-full" type="text" name="name" :value="old('name')" required autofocus autocomplete="name" />
            <x-input-error :messages="$errors->get('name')" class="mt-2" />
        </div>
        <div>
            <x-input-label for="email" value="อีเมล" />
            <x-text-input id="email" class="mt-2 block min-h-12 w-full" type="email" name="email" :value="old('email')" required autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>
        <div>
            <x-input-label for="password" value="รหัสผ่าน" />
            <x-text-input id="password" class="mt-2 block min-h-12 w-full" type="password" name="password" required autocomplete="new-password" />
            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>
        <div>
            <x-input-label for="password_confirmation" value="ยืนยันรหัสผ่าน" />
            <x-text-input id="password_confirmation" class="mt-2 block min-h-12 w-full" type="password" name="password_confirmation" required autocomplete="new-password" />
            <x-input-error :messages="$errors->get('password_confirmation')" class="mt-2" />
        </div>
        <button type="submit" class="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            สมัครใช้งาน
        </button>
    </form>

    <p class="mt-7 text-center text-sm text-slate-500">
        มีบัญชีอยู่แล้ว?
        <a class="font-semibold text-blue-600 hover:text-blue-700 hover:underline" href="{{ route('login') }}">เข้าสู่ระบบ</a>
    </p>
</x-guest-layout>
