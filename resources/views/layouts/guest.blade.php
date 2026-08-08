<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>{{ config('app.name', 'School Assets') }}</title>
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700|noto-sans-thai:400,500,600,700&display=swap" rel="stylesheet" />
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans text-slate-900 antialiased">
        <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 sm:py-12">
            <main class="w-full max-w-md">
                <a href="/" class="mb-6 flex items-center justify-center gap-3 text-slate-900">
                    <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm">SA</span>
                    <span class="text-xl font-bold tracking-tight">School Assets</span>
                </a>
                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8 sm:py-8">
                    {{ $slot }}
                </div>
                <p class="mt-6 text-center text-xs text-slate-400">ระบบจัดการครุภัณฑ์โรงเรียน</p>
            </main>
        </div>
    </body>
</html>
