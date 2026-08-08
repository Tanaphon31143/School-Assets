<div x-data="{ open: false }">
    <div class="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <button type="button" @click="open = !open" class="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="เปิดเมนู">เมนู</button>
        <a href="{{ route('dashboard') }}" class="text-base font-bold tracking-tight text-slate-900">School Assets</a>
        <a href="{{ route('notifications.index') }}" class="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100">แจ้งเตือน</a>
    </div>

    <aside :class="open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'" class="fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-slate-200 bg-white transition-transform duration-200">
        <div class="flex h-16 items-center border-b border-slate-200 px-5">
            <a href="{{ route('dashboard') }}" class="flex items-center gap-3 text-slate-900">
                <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white">SA</span>
                <span class="text-lg font-bold tracking-tight">School Assets</span>
            </a>
        </div>

        <nav class="flex-1 overflow-y-auto px-3 py-5 text-sm">
            <p class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">ภาพรวม</p>
            <a href="{{ route('dashboard') }}" class="mb-5 flex items-center rounded-xl px-3 py-2.5 font-semibold {{ request()->routeIs('dashboard','admin.dashboard','teacher.dashboard','student.dashboard') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }}">Dashboard</a>

            <p class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">จัดการครุภัณฑ์</p>
            <div class="space-y-1">
                <a href="{{ route('equipment.index') }}" class="flex items-center rounded-xl px-3 py-2.5 {{ request()->routeIs('equipment.*') ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }}">ครุภัณฑ์</a>
                <a href="{{ route('borrowings.index') }}" class="flex items-center rounded-xl px-3 py-2.5 {{ request()->routeIs('borrowings.*') ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }}">ยืม–คืน</a>
                <a href="{{ route('maintenance.index') }}" class="flex items-center rounded-xl px-3 py-2.5 {{ request()->routeIs('maintenance.*') ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }}">แจ้งซ่อม</a>
                <a href="{{ route('notifications.index') }}" class="flex items-center rounded-xl px-3 py-2.5 {{ request()->routeIs('notifications.*') ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }}">แจ้งเตือน</a>
            </div>

            @if (Auth::user()->hasRole('admin'))
                <p class="mt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">ผู้ดูแลระบบ</p>
                <div class="space-y-1">
                    <a href="{{ route('admin.equipment.index') }}" class="flex items-center rounded-xl px-3 py-2.5 {{ request()->routeIs('admin.equipment.*') ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }}">จัดการครุภัณฑ์</a>
                    <a href="{{ route('admin.users.index') }}" class="flex items-center rounded-xl px-3 py-2.5 {{ request()->routeIs('admin.users.*') ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }}">ผู้ใช้งาน</a>
                    <a href="{{ route('reports.index') }}" class="flex items-center rounded-xl px-3 py-2.5 {{ request()->routeIs('reports.*') ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }}">รายงาน</a>
                    <a href="{{ route('admin.disposals.index') }}" class="flex items-center rounded-xl px-3 py-2.5 {{ request()->routeIs('admin.disposals.*') ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }}">จำหน่ายครุภัณฑ์</a>
                </div>
            @endif
        </nav>

        <div class="border-t border-slate-200 p-4">
            <details class="group relative">
                <summary class="flex cursor-pointer list-none items-center gap-3 rounded-xl p-2 text-slate-700 hover:bg-slate-50">
                    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{{ strtoupper(substr(Auth::user()->name, 0, 1)) }}</span>
                    <span class="min-w-0 truncate"><b class="block truncate text-sm font-semibold">{{ Auth::user()->name }}</b><small class="text-xs text-slate-400">{{ Auth::user()->getRoleNames()->first() }}</small></span>
                    <span class="ml-auto text-slate-400 transition group-open:rotate-180">⌄</span>
                </summary>
                <div class="absolute bottom-14 left-0 right-0 z-50 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                    <a href="{{ route('profile.edit') }}" class="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">โปรไฟล์</a>
                    <form method="POST" action="{{ route('logout') }}">@csrf<button type="submit" class="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">ออกจากระบบ</button></form>
                </div>
            </details>
        </div>
    </aside>
    <div x-show="open" @click="open = false" class="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"></div>
</div>
