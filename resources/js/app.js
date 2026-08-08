import './bootstrap';

import Alpine from 'alpinejs';

window.Alpine = Alpine;

Alpine.start();

document.addEventListener('change', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'file' || input.name !== 'image') return;
    const file = input.files?.[0];
    if (!file) return;
    let preview = input.parentElement.querySelector('[data-image-preview]');
    if (!preview) {
        preview = document.createElement('img');
        preview.dataset.imagePreview = 'true';
        preview.className = 'mt-3 w-32 h-32 rounded-xl object-cover border border-slate-200';
        input.parentElement.appendChild(preview);
    }
    preview.src = URL.createObjectURL(file);
});

document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    const method = form.querySelector('input[name="_method"]')?.value?.toUpperCase();
    if (method !== 'DELETE' || typeof window.Swal === 'undefined') return;

    event.preventDefault();
    event.stopPropagation();

    Swal.fire({
        title: 'ยืนยันการลบข้อมูล?',
        text: 'ข้อมูลที่ลบแล้วอาจไม่สามารถกู้คืนได้',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบข้อมูล',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: false,
        focusCancel: true,
        buttonsStyling: false,
        customClass: {
            confirmButton: 'bg-red-600 text-white rounded-xl px-4 py-2.5 font-semibold hover:bg-red-700',
            cancelButton: 'bg-slate-100 text-slate-700 rounded-xl px-4 py-2.5 font-semibold hover:bg-slate-200 ml-2',
        },
    }).then((result) => {
        if (result.isConfirmed) HTMLFormElement.prototype.submit.call(form);
    });
}, true);

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.Swal === 'undefined') return;

    const flash = document.querySelector('[data-flash-success], [data-flash-error]');
    if (!flash) return;

    const isError = flash.hasAttribute('data-flash-error');
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: isError ? 'error' : 'success',
        title: flash.textContent.trim(),
        showConfirmButton: false,
        timer: 2600,
        timerProgressBar: true,
    });
    flash.remove();
});
