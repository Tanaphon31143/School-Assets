<?php
namespace App\Exports;
use App\Models\Equipment;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
class EquipmentExport implements FromCollection, WithHeadings
{
    public function collection(){return Equipment::with('category','location')->get()->map(fn($e)=>[$e->code,$e->name,$e->category?->name,$e->location?->name,$e->status,$e->condition,$e->quantity,$e->unit,$e->purchase_price]);}
    public function headings():array{return ['รหัส','ชื่อครุภัณฑ์','ประเภท','สถานที่','สถานะ','สภาพ','จำนวน','หน่วย','ราคาซื้อ'];}
}
