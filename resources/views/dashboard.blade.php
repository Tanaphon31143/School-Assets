<x-app-layout>
    <x-slot name="header">
        <p class="text-xs font-medium tracking-wide text-slate-400">ภาพรวมระบบ</p>
        <h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">แดชบอร์ด</h2>
    </x-slot>

    <div class="px-4 py-8 sm:px-8">
        <div class="mb-7">
            <h1 class="text-xl font-bold tracking-tight text-slate-900">สรุปครุภัณฑ์ของโรงเรียน</h1>
            <p class="mt-1 text-sm leading-6 text-slate-500">ติดตามสถานะครุภัณฑ์และรายการยืมคืนได้จากหน้านี้</p>
        </div>

        <div class="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            @foreach ([
                ['label' => 'ครุภัณฑ์ทั้งหมด', 'value' => $stats['total'], 'bar' => 'bg-blue-500'],
                ['label' => 'พร้อมใช้งาน', 'value' => $stats['available'], 'bar' => 'bg-emerald-500'],
                ['label' => 'กำลังถูกยืม', 'value' => $stats['borrowed'], 'bar' => 'bg-amber-500'],
                ['label' => 'ชำรุด / อยู่ระหว่างซ่อม', 'value' => $stats['maintenance'], 'bar' => 'bg-rose-500'],
            ] as $stat)
                <div class="ui-card p-5">
                    <p class="text-sm font-medium text-slate-500">{{ $stat['label'] }}</p>
                    <p class="mt-3 text-3xl font-bold tracking-tight text-slate-900">{{ number_format($stat['value']) }}</p>
                    <div class="mt-5 h-1.5 rounded-full bg-slate-100">
                        <div class="h-1.5 w-3/4 rounded-full {{ $stat['bar'] }}"></div>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="grid gap-6 xl:grid-cols-3">
            <section class="ui-card p-5 sm:p-6 xl:col-span-2">
                <div class="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h3 class="font-bold text-slate-900">สถานะครุภัณฑ์</h3>
                        <p class="mt-1 text-sm text-slate-500">ภาพรวมจำนวนครุภัณฑ์ตามสถานะปัจจุบัน</p>
                    </div>
                    <a href="{{ route('equipment.index') }}" class="text-sm font-semibold text-blue-600 hover:text-blue-700">ดูรายการทั้งหมด</a>
                </div>
                <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div class="rounded-xl bg-emerald-50 p-4"><p class="text-xs text-emerald-700">พร้อมใช้งาน</p><p class="mt-2 text-2xl font-bold text-emerald-800">{{ $stats['available'] }}</p></div>
                    <div class="rounded-xl bg-blue-50 p-4"><p class="text-xs text-blue-700">กำลังยืม</p><p class="mt-2 text-2xl font-bold text-blue-800">{{ $stats['borrowed'] }}</p></div>
                    <div class="rounded-xl bg-amber-50 p-4"><p class="text-xs text-amber-700">กำลังซ่อม</p><p class="mt-2 text-2xl font-bold text-amber-800">{{ $stats['maintenance'] }}</p></div>
                    <div class="rounded-xl bg-slate-100 p-4"><p class="text-xs text-slate-600">รวมทั้งหมด</p><p class="mt-2 text-2xl font-bold text-slate-800">{{ $stats['total'] }}</p></div>
                </div>
            </section>

            <section class="ui-card p-5 sm:p-6">
                <h3 class="font-bold text-slate-900">เมนูด่วน</h3>
                <p class="mt-1 text-sm text-slate-500">ไปยังหน้าที่ใช้งานบ่อย</p>
                <div class="mt-5 space-y-2">
                    <a href="{{ route('equipment.index') }}" class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">ค้นหาครุภัณฑ์ <span>→</span></a>
                    <a href="{{ route('borrowings.index') }}" class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">รายการยืม–คืน <span>→</span></a>
                    <a href="{{ route('maintenance.index') }}" class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">ติดตามงานซ่อม <span>→</span></a>
                    @if (auth()->user()->hasRole('admin'))
                        <a href="{{ route('admin.equipment.create') }}" class="flex items-center justify-between rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">เพิ่มครุภัณฑ์ <span>+</span></a>
                    @endif
                </div>
            </section>
        </div>

        <section class="ui-card mt-6 overflow-hidden">
            <div class="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
                <div><h3 class="font-bold text-slate-900">รายการยืมล่าสุด</h3><p class="mt-1 text-sm text-slate-500">รายการที่มีการดำเนินการล่าสุด</p></div>
                <a href="{{ route('borrowings.index') }}" class="text-sm font-semibold text-blue-600 hover:text-blue-700">ดูทั้งหมด</a>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead><tr class="border-b border-slate-100 text-left"><th class="p-4">ครุภัณฑ์</th><th class="p-4">ผู้ยืม</th><th class="p-4">วันที่ยืม</th><th class="p-4">สถานะ</th></tr></thead>
                    <tbody>
                        @forelse ($recentBorrowings as $borrow)
                            <tr class="border-b border-slate-100 last:border-0"><td class="p-4 font-medium text-slate-800">{{ $borrow->equipment->name }}</td><td class="p-4 text-slate-500">{{ $borrow->borrower->name }}</td><td class="p-4 text-slate-500">{{ $borrow->borrow_date?->format('d/m/Y') }}</td><td class="p-4"><span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{{ $borrow->status }}</span></td></tr>
                        @empty
                            <tr><td colspan="4" class="p-8 text-center text-slate-400">ยังไม่มีรายการยืม</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</x-app-layout>
