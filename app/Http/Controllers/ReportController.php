<?php
namespace App\Http\Controllers;
use App\Models\Equipment;
use App\Models\EquipmentBorrowing;
use App\Exports\EquipmentExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
class ReportController extends Controller {
 public function index(){$equipment=Equipment::with('category')->get();$byStatus=$equipment->groupBy('status')->map->count();$byCategory=$equipment->groupBy(fn($e)=>$e->category?->name??'ไม่ระบุ')->map->count();$totalValue=$equipment->sum(fn($e)=>$e->purchase_price*$e->quantity);return view('reports.index',compact('equipment','byStatus','byCategory','totalValue'));}
 public function borrowings(\Illuminate\Http\Request $request){$query=EquipmentBorrowing::with(['equipment','borrower'])->when($request->status,fn($q,$v)=>$q->where('status',$v))->when($request->from,fn($q,$v)=>$q->whereDate('borrow_date','>=',$v))->when($request->to,fn($q,$v)=>$q->whereDate('borrow_date','<=',$v));$borrowings=$query->latest()->paginate(25)->withQueryString();$summary=EquipmentBorrowing::selectRaw('status, count(*) as total')->groupBy('status')->pluck('total','status');return view('reports.borrowings',compact('borrowings','summary'));}
 public function qrPrint(\Illuminate\Http\Request $request){$allEquipment=Equipment::whereNotIn('status',['disposed'])->orderBy('code')->get();$equipment=$request->filled('ids')?$allEquipment->whereIn('id',(array)$request->input('ids')):$allEquipment;return view('reports.qr',compact('equipment','allEquipment'));}
 public function csv(){return Excel::download(new EquipmentExport,'equipment-report.xlsx');}
 public function pdf(){return Pdf::loadView('reports.pdf',['equipment'=>Equipment::with('category')->get()])->download('equipment-report.pdf');}
 public function qr(Equipment $equipment){$target=url(route('equipment.public',$equipment,false));$svg=(string)\SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')->size(280)->generate($target);return view('reports.qr-single',compact('equipment','svg'));}
}
