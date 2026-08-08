<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\EquipmentLocation;
use Illuminate\Http\Request;
class EquipmentLocationController extends Controller
{
    public function index(Request $request){ $locations=EquipmentLocation::withCount('equipment')->when($request->search,fn($q,$v)=>$q->where('name','like',"%$v%")->orWhere('building','like',"%$v%"))->latest()->paginate(15)->withQueryString(); return view('admin.locations.index',compact('locations')); }
    public function create(){return view('admin.locations.create');}
    public function store(Request $request){$data=$request->validate(['name'=>'required|string|max:255','building'=>'nullable|string|max:255','floor'=>'nullable|string|max:50','description'=>'nullable|string']); EquipmentLocation::create($data); return redirect()->route('admin.locations.index')->with('success','เพิ่มสถานที่จัดเก็บแล้ว');}
    public function edit(EquipmentLocation $location){return view('admin.locations.edit',compact('location'));}
    public function update(Request $request, EquipmentLocation $location){$data=$request->validate(['name'=>'required|string|max:255','building'=>'nullable|string|max:255','floor'=>'nullable|string|max:50','description'=>'nullable|string']); $location->update($data); return redirect()->route('admin.locations.index')->with('success','แก้ไขสถานที่จัดเก็บแล้ว');}
    public function destroy(EquipmentLocation $location){if($location->equipment()->exists())return back()->with('error','ไม่สามารถลบสถานที่ที่มีครุภัณฑ์อยู่ได้'); $location->delete(); return back()->with('success','ลบสถานที่จัดเก็บแล้ว');}
}
