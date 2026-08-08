<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\EquipmentCategory;
use App\Models\EquipmentLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Http\Requests\StoreEquipmentRequest;
use App\Http\Requests\UpdateEquipmentRequest;
class EquipmentController extends Controller
{
    public function index(Request $request){$equipment=Equipment::with(['category','location'])->when($request->search,fn($q,$v)=>$q->where(fn($x)=>$x->where('name','like',"%$v%")->orWhere('code','like',"%$v%")))->when($request->status,fn($q,$v)=>$q->where('status',$v))->latest()->paginate(15)->withQueryString();return view('admin.equipment.index',compact('equipment'));}
    public function create(){return view('admin.equipment.create',['categories'=>EquipmentCategory::orderBy('name')->get(),'locations'=>EquipmentLocation::orderBy('name')->get()]);}
    public function store(StoreEquipmentRequest $request){$data=$request->validated();$data['created_by']=$request->user()->id;if($request->hasFile('image'))$data['image']=$request->file('image')->store('equipment','public');Equipment::create($data);return redirect()->route('admin.equipment.index')->with('success','เพิ่มครุภัณฑ์แล้ว');}
    public function show(Equipment $equipment){$equipment->load(['category','location','borrowings.borrower','maintenances']);return view('admin.equipment.show',compact('equipment'));}
    public function edit(Equipment $equipment){return view('admin.equipment.edit',['equipment'=>$equipment,'categories'=>EquipmentCategory::orderBy('name')->get(),'locations'=>EquipmentLocation::orderBy('name')->get()]);}
    public function update(UpdateEquipmentRequest $request, Equipment $equipment){$data=$request->validated();if($request->hasFile('image')){$data['image']=$request->file('image')->store('equipment','public');} $equipment->update($data);return redirect()->route('admin.equipment.index')->with('success','แก้ไขครุภัณฑ์แล้ว');}
    public function destroy(Equipment $equipment){if($equipment->borrowings()->whereIn('status',['pending','approved','borrowed','overdue'])->exists())return back()->with('error','ไม่สามารถลบครุภัณฑ์ที่มีรายการยืมอยู่ได้');$equipment->delete();return back()->with('success','ลบครุภัณฑ์แล้ว');}
    private function validated(Request $request, ?Equipment $equipment=null){return $request->validate(['code'=>['required','max:100',Rule::unique('equipment','code')->ignore($equipment?->id)],'name'=>'required|string|max:255','equipment_category_id'=>'required|exists:equipment_categories,id','equipment_location_id'=>'nullable|exists:equipment_locations,id','brand'=>'nullable|max:255','model'=>'nullable|max:255','serial_number'=>'nullable|max:255','purchase_date'=>'nullable|date','purchase_price'=>'nullable|numeric|min:0','quantity'=>'required|integer|min:1','unit'=>'required|max:50','status'=>'required|in:available,borrowed,maintenance,damaged,disposed','condition'=>'required|in:new,good,fair,poor','warranty_expire_date'=>'nullable|date','notes'=>'nullable|string','image'=>'nullable|image|max:2048']);}
}
