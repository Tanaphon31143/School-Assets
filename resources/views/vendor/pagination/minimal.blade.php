@if ($paginator->hasPages())
    <nav class="flex flex-col items-center justify-between gap-3 sm:flex-row" aria-label="Pagination">
        <p class="text-sm text-slate-500">
            แสดง {{ $paginator->firstItem() }}–{{ $paginator->lastItem() }} จาก {{ $paginator->total() }} รายการ
        </p>

        <div class="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            @if ($paginator->onFirstPage())
                <span class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300" aria-disabled="true">‹</span>
            @else
                <a href="{{ $paginator->previousPageUrl() }}" class="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="หน้าก่อนหน้า">‹</a>
            @endif

            @foreach ($elements as $element)
                @if (is_string($element))
                    <span class="flex h-9 min-w-9 items-center justify-center px-1 text-sm text-slate-400">{{ $element }}</span>
                @endif

                @if (is_array($element))
                    @foreach ($element as $page => $url)
                        @if ($page == $paginator->currentPage())
                            <span class="flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-600 px-2 text-sm font-semibold text-white" aria-current="page">{{ $page }}</span>
                        @else
                            <a href="{{ $url }}" class="flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm text-slate-600 transition hover:bg-blue-50 hover:text-blue-700">{{ $page }}</a>
                        @endif
                    @endforeach
                @endif
            @endforeach

            @if ($paginator->hasMorePages())
                <a href="{{ $paginator->nextPageUrl() }}" class="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="หน้าถัดไป">›</a>
            @else
                <span class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300" aria-disabled="true">›</span>
            @endif
        </div>
    </nav>
@endif
