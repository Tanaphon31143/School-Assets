<!DOCTYPE html>
<html lang="th">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'School Assets') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700|noto-sans-thai:400,500,600,700&display=swap" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans antialiased text-slate-800">
        <div class="min-h-screen bg-[#f7f8fa] lg:pl-64">
            @include('layouts.navigation')

            <!-- Page Heading -->
            @isset($header)
                <header class="border-b border-slate-200/80 bg-white">
                    <div class="mx-auto max-w-[1500px] px-4 py-6 sm:px-8">
                        {{ $header }}
                    </div>
                </header>
            @endisset

            <!-- Page Content -->
            <main>
                <div class="max-w-[1500px] mx-auto">{{ $slot }}</div>
            </main>
        </div>
        @if (session('success'))<div data-flash-success class="hidden">{{ session('success') }}</div>@endif
        @if (session('error'))<div data-flash-error class="hidden">{{ session('error') }}</div>@endif
    </body>
</html>
