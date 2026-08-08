<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\EquipmentDisposal;
use Illuminate\Http\Request;
class EquipmentDisposalController extends Controller
{
    public function index(){ $disposals=EquipmentDisposal::with(['equipment','approver'])->latest()->paginate(15); return view('admin.disposals.index',compact('disposals')); }
    public function create(){ $equipment=Equipment::whereNotIn('status',['disposed'])->orderBy('code')->get(); return view('admin.disposals.create',compact('equipment')); }
    public function store(Request $request){ $data=$request->validate(['equipment_id'=>'required|exists:equipment,id','disposal_date'=>'required|date','reason'=>'required|string|max:2000','disposal_method'=>'required|in:sold,destroyed,donated','notes'=>'nullable|string']); $item=Equipment::findOrFail($data['equipment_id']); abort_if($item->status==='disposed',422,'ครุภัณฑ์ถูกจำหน่ายแล้ว'); $data['approved_by']=$request->user()->id; EquipmentDisposal::create($data); $item->update(['status'=>'disposed']); return redirect()->route('admin.disposals.index')->with('success','บันทึกการจำหน่ายครุภัณฑ์แล้ว'); }
}
